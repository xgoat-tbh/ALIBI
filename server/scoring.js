export function calculateScoring(room) {
  const gt = room.caseData?.groundTruth;
  const reconstruction = room.reconstruction;
  if (!gt) return;

  let correctCategories = 0;
  if (reconstruction.who === gt.who) correctCategories++;
  if (reconstruction.where === gt.where) correctCategories++;
  if (reconstruction.when === gt.when) correctCategories++;
  if (reconstruction.how === gt.how) correctCategories++;
  if (reconstruction.why === gt.why) correctCategories++;

  room.trustPoints = correctCategories * 20;

  const totalLocked = room.players.filter(p => p.currentLock !== null).length;
  const incorrectCount = room.players.filter(p => p.currentLock && !p.currentLock.isCorrect).length;

  const highlights = [];

  room.players.forEach(player => {
    let delta = 0;
    const isCorrect = player.currentLock ? player.currentLock.isCorrect : false;

    if (player.currentLock && player.currentStake) {
      if (isCorrect) {
        if (player.currentStake === 'Hunch') delta += 10;
        if (player.currentStake === 'Confident') delta += 25;
        if (player.currentStake === 'Certain') delta += 50;
        if (totalLocked > 1 && (incorrectCount / totalLocked) > 0.5) {
          delta += 20;
          player.minorityReportTriggered = true;
        } else {
          player.minorityReportTriggered = false;
        }
      } else {
        if (player.currentStake === 'Hunch') delta += 0;
        if (player.currentStake === 'Confident') delta -= 10;
        if (player.currentStake === 'Certain') delta -= 25;
        player.minorityReportTriggered = false;
      }
    }

    player.lastScoreDelta = delta;
    player.score += delta;

    let ratingDelta = 0;
    if (player.currentStake === 'Certain') ratingDelta = isCorrect ? +15 : -25;
    else if (player.currentStake === 'Confident') ratingDelta = isCorrect ? +8 : -10;
    else if (player.currentStake === 'Hunch') ratingDelta = isCorrect ? +3 : 0;
    player.detectiveRating = Math.max(500, (player.detectiveRating || 1000) + ratingDelta);
  });

  const confidentWrong = room.players.find(p => p.currentStake === 'Certain' && p.currentLock && !p.currentLock.isCorrect);
  if (confidentWrong) {
    highlights.push({ type: 'blunder', text: `${confidentWrong.name} was absolutely Certain of their memory... but it was completely fabricated!` });
  }
  const hero = room.players.find(p => p.minorityReportTriggered);
  if (hero) {
    highlights.push({ type: 'hero', text: `${hero.name} was the lone voice of reason, standing by a memory that the rest of the table doubted!` });
  }
  const allCorrect = room.players.length > 0 && room.players.every(p => p.currentLock && p.currentLock.isCorrect);
  if (allCorrect) {
    highlights.push({ type: 'synergy', text: 'The table shares a singular consciousness: Every single detective locked in a correct memory!' });
  }
  if (highlights.length === 0) {
    highlights.push({ type: 'info', text: `Investigation complete. The team achieved a ${room.trustPoints}% reconstruction accuracy.` });
  }
  room.highlights = highlights;
}

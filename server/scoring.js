function normalizeText(s) {
  if (!s) return '';
  return String(s).toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
}

function matchCategory(input, truth) {
  const a = normalizeText(input);
  const b = normalizeText(truth);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  const aWords = a.split(' ');
  const bWords = b.split(' ');
  if (aWords.length === 1 && bWords.includes(aWords[0])) return true;
  if (bWords.length === 1 && aWords.includes(bWords[0])) return true;
  return false;
}

export function calculateScoring(room) {
  const gt = room.caseData?.groundTruth;
  const reconstruction = room.reconstruction;
  if (!gt) return;

  let correctCategories = 0;
  if (matchCategory(reconstruction.who, gt.who)) correctCategories++;
  if (matchCategory(reconstruction.where, gt.where)) correctCategories++;
  if (matchCategory(reconstruction.when, gt.when)) correctCategories++;
  if (matchCategory(reconstruction.how, gt.how)) correctCategories++;
  if (matchCategory(reconstruction.why, gt.why)) correctCategories++;

  room.trustPoints = correctCategories * 20;

  const totalLocked = room.players.filter(p => p.currentLock !== null).length;
  const incorrectCount = room.players.filter(p => p.currentLock && !p.currentLock.isCorrect && !p.isSaboteur).length;

  const highlights = [];

  room.players.forEach(player => {
    let delta = 0;
    const isCorrect = player.currentLock ? player.currentLock.isCorrect : false;

    if (player.currentLock && player.currentStake) {
      const stakeValues = { Hunch: { win: 10, lose: 0 }, Confident: { win: 25, lose: -10 }, Certain: { win: 50, lose: -25 } };
      const s = stakeValues[player.currentStake] || { win: 0, lose: 0 };

      if (player.isSaboteur) {
        // Saboteur: rewarded for being WRONG, penalized for being RIGHT
        if (!isCorrect) {
          delta += s.win;
          // Saboteur gets bonus for each wrong reconstruction category
          delta += (5 - correctCategories) * 5;
        } else {
          delta += s.lose;
        }
        player.minorityReportTriggered = false;
      } else {
        // Normal scoring
        if (isCorrect) {
          delta += s.win;
          if (totalLocked > 1 && (incorrectCount / totalLocked) > 0.5) {
            delta += 20;
            player.minorityReportTriggered = true;
          } else {
            player.minorityReportTriggered = false;
          }
        } else {
          delta += s.lose;
          player.minorityReportTriggered = false;
        }
      }
    }

    player.lastScoreDelta = delta;
    player.score += delta;

    let ratingDelta = 0;
    if (player.isSaboteur) {
      if (player.currentStake === 'Certain') ratingDelta = !isCorrect ? +20 : -30;
      else if (player.currentStake === 'Confident') ratingDelta = !isCorrect ? +10 : -15;
      else if (player.currentStake === 'Hunch') ratingDelta = !isCorrect ? +5 : 0;
    } else {
      if (player.currentStake === 'Certain') ratingDelta = isCorrect ? +15 : -25;
      else if (player.currentStake === 'Confident') ratingDelta = isCorrect ? +8 : -10;
      else if (player.currentStake === 'Hunch') ratingDelta = isCorrect ? +3 : 0;
    }
    player.detectiveRating = Math.max(500, (player.detectiveRating || 1000) + ratingDelta);
  });

  // Build highlights
  const confidentWrong = room.players.find(p => p.currentStake === 'Certain' && p.currentLock && !p.currentLock.isCorrect);
  if (confidentWrong && !confidentWrong.isSaboteur) {
    highlights.push({ type: 'blunder', text: `${confidentWrong.name} was absolutely Certain of their memory... but it was completely fabricated!` });
  }
  const hero = room.players.find(p => p.minorityReportTriggered);
  if (hero) {
    highlights.push({ type: 'hero', text: `${hero.name} was the lone voice of reason, standing by a memory the rest of the table doubted!` });
  }
  const allCorrect = room.players.length > 0 && room.players.every(p => p.currentLock && p.currentLock.isCorrect);
  if (allCorrect) {
    highlights.push({ type: 'synergy', text: 'Every detective locked in a correct memory. The table shares a singular consciousness!' });
  }
  const saboteur = room.players.find(p => p.isSaboteur);
  if (saboteur) {
    const saboteurScore = saboteur.lastScoreDelta || 0;
    if (saboteurScore > 0) {
      highlights.push({ type: 'traitor', text: `${saboteur.name} was the SABOTEUR — they sabotaged the investigation from within and profited ${saboteurScore > 0 ? '+' : ''}${saboteurScore} points!` });
    } else {
      highlights.push({ type: 'traitor_caught', text: `${saboteur.name} was the SABOTEUR, but the team saw through their deception!` });
    }
  }
  if (highlights.length === 0) {
    highlights.push({ type: 'info', text: `Investigation complete. The team achieved ${room.trustPoints}% reconstruction accuracy.` });
  }
  room.highlights = highlights;
}

import React from 'react';
import { User, MapPin, Clock, Eye, Lightbulb, CheckCircle2, XCircle, Skull, Trophy, Swords } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';

function TruthReveal({ caseData, players = [], reconstruction, phaseTimer }) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (!caseData || !caseData.groundTruth) return null;

  const gt = caseData.groundTruth;

  const getRevealLevel = () => {
    if (phaseTimer > 16) return 1;
    if (phaseTimer > 12) return 2;
    if (phaseTimer > 8) return 3;
    if (phaseTimer > 4) return 4;
    return 5;
  };

  const revealLevel = getRevealLevel();

  const revealCategories = [
    { id: 'who', label: 'WHO', gtValue: gt.who, guessValue: reconstruction?.who, icon: <User size={16} />, level: 1 },
    { id: 'where', label: 'WHERE', gtValue: gt.where, guessValue: reconstruction?.where, icon: <MapPin size={16} />, level: 2 },
    { id: 'when', label: 'WHEN', gtValue: gt.when, guessValue: reconstruction?.when, icon: <Clock size={16} />, level: 3 },
    { id: 'how', label: 'HOW', gtValue: gt.how, guessValue: reconstruction?.how, icon: <Eye size={16} />, level: 4 },
    { id: 'why', label: 'WHY', gtValue: gt.why, guessValue: reconstruction?.why, icon: <Lightbulb size={16} />, level: 5 }
  ];

  const saboteur = players.find(p => p.isSaboteur);
  const revealDone = revealLevel >= 5;

  return (
    <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: isMobile ? '4px 0' : '10px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: isMobile ? '16px' : '24px' }}>
        <span style={{ fontSize: isMobile ? '0.6rem' : '0.7rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>CASE RESOLUTION</span>
        <h3 className="font-display" style={{ fontSize: isMobile ? '1.5rem' : '2.5rem', fontWeight: '400', marginTop: '4px', color: '#ffffff' }}>The Verdict</h3>
      </div>

      {/* Stakes Table */}
      {revealDone && (
        <div style={{ marginBottom: '16px', padding: '12px 14px', background: 'rgba(0,0,0,0.15)', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
          <h4 style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Swords size={12} style={{ color: 'var(--accent-purple)' }} />
            Confidence Ledger
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {players.filter(p => p.currentStake).map(p => {
              const isCorrect = p.currentLock?.isCorrect ?? false;
              const stakeColor = p.currentStake === 'Certain' ? 'var(--color-danger)' : p.currentStake === 'Confident' ? 'var(--color-warning)' : 'var(--text-muted)';
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', borderRadius: '4px', background: p.isSaboteur ? 'rgba(220,38,38,0.05)' : 'transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {p.isSaboteur ? <Skull size={10} style={{ color: 'var(--color-danger)' }} /> : null}
                    <span style={{ fontSize: '0.75rem', fontWeight: p.isSaboteur ? '700' : '500', color: p.isSaboteur ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                      {p.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.65rem', padding: '2px 5px', borderRadius: '3px', background: stakeColor === 'var(--color-danger)' ? 'var(--color-danger-dim)' : stakeColor === 'var(--color-warning)' ? 'var(--color-warning-dim)' : 'rgba(255,255,255,0.02)', color: stakeColor }}>
                      {p.currentStake || '-'}
                    </span>
                    {isCorrect ? (
                      <CheckCircle2 size={12} style={{ color: 'var(--color-success)' }} />
                    ) : (
                      <XCircle size={12} style={{ color: 'var(--color-danger)' }} />
                    )}
                    <span className="font-tech" style={{ fontSize: '0.7rem', fontWeight: '700', color: p.lastScoreDelta >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      {p.lastScoreDelta > 0 ? '+' : ''}{p.lastScoreDelta}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Saboteur Reveal */}
      {revealDone && saboteur && (
        <div style={{
          marginBottom: '16px', padding: '12px 14px',
          background: 'rgba(220, 38, 38, 0.08)',
          border: '1px solid rgba(220, 38, 38, 0.2)',
          borderRadius: '6px',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <Skull size={20} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-danger)' }}>
              Saboteur Unmasked
            </span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              <strong style={{ color: 'var(--color-danger)' }}>{saboteur.name}</strong> was the mole. {saboteur.lastScoreDelta > 0 ? `They profited +${saboteur.lastScoreDelta} points by sabotaging the investigation.` : 'The team saw through their deception.'}
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '6px' : '10px', maxWidth: '780px', width: '100%', margin: '0 auto' }}>
        {revealCategories.map((cat) => {
          const isRevealed = revealLevel >= cat.level;
          const isCorrect = cat.guessValue === cat.gtValue;

          return (
            <div
              className="surface animate-fade-in"
              style={{
                padding: isMobile ? '8px 12px' : '14px 18px',
                border: '1px solid var(--border-glass)',
                opacity: isRevealed ? 1 : 0.2,
                backgroundColor: isRevealed
                  ? isCorrect
                    ? 'rgba(16, 185, 129, 0.02)'
                    : 'rgba(244, 63, 94, 0.02)'
                  : 'rgba(255, 255, 255, 0.01)',
                display: 'grid',
                gridTemplateColumns: isMobile ? 'auto 1fr auto' : 'auto 1.2fr 1.2fr auto',
                alignItems: 'center',
                gap: isMobile ? '8px' : '20px'
              }}
            >
              <div
                style={{
                  width: isMobile ? '24px' : '32px',
                  height: isMobile ? '24px' : '32px',
                  borderRadius: '50%',
                  backgroundColor: isRevealed ? (isCorrect ? 'var(--color-success-dim)' : 'var(--color-danger-dim)') : 'rgba(255, 255, 255, 0.01)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isRevealed ? (isCorrect ? 'var(--color-success)' : 'var(--color-danger)') : 'var(--text-muted)',
                  border: '1px solid var(--border-glass)'
                }}
              >
                {cat.icon}
              </div>

              <div>
                <span style={{ fontSize: isMobile ? '0.5rem' : '0.6rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  {cat.label} (Truth)
                </span>
                {isRevealed ? (
                  <p className="font-display" style={{ fontSize: isMobile ? '0.9rem' : '1.3rem', fontWeight: '400', color: '#ffffff', marginTop: '1px' }}>
                    {cat.gtValue}
                  </p>
                ) : (
                  <p style={{ fontSize: isMobile ? '0.8rem' : '1rem', fontWeight: '700', color: 'var(--text-muted)', marginTop: '2px', letterSpacing: '2px' }}>
                    &bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;
                  </p>
                )}
              </div>

              {(!isMobile || isRevealed) && (
                <div>
                  <span style={{ fontSize: isMobile ? '0.5rem' : '0.6rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                    Your Guess
                  </span>
                  {isRevealed ? (
                    <p className="font-display" style={{ fontSize: isMobile ? '0.85rem' : '1.2rem', fontWeight: '400', color: isCorrect ? 'var(--color-success)' : 'var(--color-danger)', marginTop: '1px' }}>
                      {cat.guessValue || 'Unanswered'}
                    </p>
                  ) : (
                    <p style={{ fontSize: isMobile ? '0.75rem' : '0.9rem', fontWeight: '600', color: 'var(--text-muted)', marginTop: '2px', letterSpacing: '2px' }}>
                      &bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;
                    </p>
                  )}
                </div>
              )}

              <div>
                {isRevealed ? (
                  isCorrect ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--color-success)' }}>
                      <CheckCircle2 size={isMobile ? 10 : 14} />
                      {!isMobile && <span style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Hit</span>}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--color-danger)' }}>
                      <XCircle size={isMobile ? 10 : 14} />
                      {!isMobile && <span style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Miss</span>}
                    </div>
                  )
                ) : (
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.05em' }}>
                    HIDDEN
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {revealLevel < 5 && (
        <div style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-muted)', fontSize: isMobile ? '0.6rem' : '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Declassifying next data packet...
        </div>
      )}
    </div>
  );
}

export default TruthReveal;

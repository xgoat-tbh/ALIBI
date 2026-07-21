import React from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';

function LinkedReveal({ revealGroups = [], currentPrompt, currentRound, totalRounds }) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: isMobile ? '16px' : '28px', gap: isMobile ? '16px' : '24px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: isMobile ? '0.6rem' : '0.7rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Round {currentRound} / {totalRounds}
        </span>
      </div>

      <div style={{
        padding: isMobile ? '10px 20px' : '14px 28px',
        background: 'rgba(255, 94, 91, 0.05)',
        border: '1px solid rgba(255, 94, 91, 0.15)',
        borderRadius: '8px'
      }}>
        <span style={{ fontSize: isMobile ? '0.55rem' : '0.6rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-primary)' }}>Prompt: </span>
        <span className="font-display" style={{ fontSize: isMobile ? '1.4rem' : '2rem', fontWeight: '400', color: '#ffffff', marginLeft: '6px' }}>{currentPrompt}</span>
      </div>

      <h3 style={{ fontSize: isMobile ? '0.7rem' : '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', margin: 0 }}>
        Results
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '450px' }}>
        {revealGroups.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '20px' }}>No submissions this round.</div>
        )}
        {revealGroups.map((group, gi) => {
          const size = group.length;
          const isMatch = size >= 3;
          const isPair = size === 2;
          const isLone = size === 1;
          const pts = group[0]?.points || 0;

          return (
            <div key={gi} className="animate-scale-in" style={{
              padding: isMobile ? '10px 12px' : '12px 16px',
              borderRadius: '8px',
              background: isMatch ? 'var(--color-match-dim)' : isPair ? 'var(--color-warning-dim)' : 'var(--color-unique-dim)',
              border: `1px solid ${isMatch ? 'rgba(0,245,212,0.2)' : isPair ? 'rgba(255,210,63,0.2)' : 'rgba(241,91,181,0.2)'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: isMobile ? '0.8rem' : '0.95rem', fontWeight: '700', color: '#ffffff' }}>
                  {group[0].word}
                </span>
                <span style={{
                  fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px', borderRadius: '4px',
                  background: isMatch ? 'var(--color-match-dim)' : isPair ? 'var(--color-warning-dim)' : 'var(--color-unique-dim)',
                  color: isMatch ? 'var(--color-match)' : isPair ? 'var(--color-warning)' : 'var(--color-unique)'
                }}>
                  {size} {size === 1 ? 'unique' : size === 2 ? 'pair' : 'match'} — {pts > 0 ? `+${pts}` : '0'}
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {group.map((s, si) => (
                  <span key={si} style={{ fontSize: isMobile ? '0.6rem' : '0.7rem', color: 'var(--text-secondary)' }}>
                    {s.playerName}{si < group.length - 1 ? ',' : ''}
                  </span>
                ))}
                {group[0]?.isPromptRepeat && (
                  <span style={{ fontSize: '0.6rem', color: 'var(--color-danger)', marginLeft: '6px' }}>(repeat)</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LinkedReveal;

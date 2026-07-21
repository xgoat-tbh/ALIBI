import React from 'react';
import { Crown, Skull, Trophy, RotateCcw, Swords } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';

function LinkedResults({ players = [], standings = [], totalRounds, playerId, isHost, onPlayAgain, onStartTiebreaker }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const sorted = standings.length > 0 ? standings : [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const loser = sorted[sorted.length - 1];
  const topScore = sorted[0]?.score;
  const topTied = standings.filter(p => p.score === topScore);
  const hasTie = topTied.length > 1;

  return (
    <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: isMobile ? '16px' : '28px', gap: isMobile ? '16px' : '24px' }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: isMobile ? '0.6rem' : '0.7rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Game Over — {totalRounds} Rounds
        </span>
      </div>

      {!hasTie ? (
        <div style={{
          padding: isMobile ? '20px 24px' : '28px 40px',
          background: 'rgba(255, 210, 63, 0.06)',
          border: '1px solid rgba(255, 210, 63, 0.2)',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <Crown size={isMobile ? 28 : 36} style={{ color: 'var(--color-warning)' }} />
          <h2 className="font-display" style={{ fontSize: isMobile ? '1.6rem' : '2.5rem', fontWeight: '400', color: '#ffffff', margin: '4px 0' }}>
            {winner?.name}
          </h2>
          <p style={{ fontSize: isMobile ? '0.75rem' : '0.85rem', color: 'var(--text-secondary)' }}>
            {winner?.score} points — <strong style={{ color: 'var(--color-warning)' }}>Crowned</strong>
          </p>
        </div>
      ) : (
        <div style={{
          padding: isMobile ? '16px 20px' : '20px 32px',
          background: 'rgba(255, 210, 63, 0.06)',
          border: '1px solid rgba(255, 210, 63, 0.2)',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <Swords size={isMobile ? 24 : 32} style={{ color: 'var(--color-warning)' }} />
          <p style={{ fontSize: isMobile ? '0.8rem' : '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            <strong style={{ color: '#ffffff' }}>{topTied.map(p => p.name).join(', ')}</strong> are tied at {topScore} points
          </p>
          <p style={{ fontSize: isMobile ? '0.7rem' : '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            A tiebreaker round will decide the winner.
          </p>
        </div>
      )}

      <div style={{
        padding: isMobile ? '10px 16px' : '12px 20px',
        background: 'rgba(255, 94, 91, 0.06)',
        border: '1px solid rgba(255, 94, 91, 0.15)',
        borderRadius: '8px',
        display: 'flex', alignItems: 'center', gap: '8px'
      }}>
        <Skull size={isMobile ? 14 : 18} style={{ color: 'var(--color-danger)' }} />
        <span style={{ fontSize: isMobile ? '0.7rem' : '0.8rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--color-danger)' }}>{loser?.name}</strong> finished last ({loser?.score} pts) — the -1 L badge is permanent.
        </span>
      </div>

      <div style={{ width: '100%', maxWidth: '400px' }}>
        <h3 style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Trophy size={14} style={{ color: 'var(--accent-primary)' }} />
          Final Standings
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {sorted.map((p, i) => {
            const isMe = p.id === playerId;
            const rankColors = ['var(--color-warning)', 'var(--text-secondary)', 'var(--accent-primary)', 'var(--text-muted)'];
            return (
              <div key={p.id || p.name} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: isMobile ? '8px 12px' : '10px 14px',
                borderRadius: '6px',
                background: isMe ? 'rgba(255, 94, 91, 0.06)' : 'transparent',
                border: isMe ? '1px solid rgba(255, 94, 91, 0.15)' : '1px solid var(--border-glass)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="font-tech" style={{ fontSize: '0.8rem', fontWeight: '700', color: rankColors[i] || 'var(--text-muted)', width: '20px' }}>
                    {i + 1}.
                  </span>
                  <span style={{ fontSize: isMobile ? '0.75rem' : '0.85rem', fontWeight: isMe ? '700' : '500', color: isMe ? '#ffffff' : 'var(--text-primary)' }}>
                    {p.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="font-tech" style={{ fontSize: '0.8rem', fontWeight: '700', color: '#ffffff' }}>{p.score}</span>
                  {i === 0 && !hasTie && <Crown size={12} style={{ color: 'var(--color-warning)' }} />}
                  {i === sorted.length - 1 && sorted.length > 2 && <Skull size={12} style={{ color: 'var(--color-danger)' }} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isHost && (
        <button onClick={onPlayAgain} className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RotateCcw size={14} />
          Play Again
        </button>
      )}
    </div>
  );
}

export default LinkedResults;

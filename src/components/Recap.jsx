import React, { useState, useEffect } from 'react';
import { Award, ShieldCheck, RotateCcw, Activity } from 'lucide-react';

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = (e) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);
  return matches;
}

function Recap({
  status,
  reconstruction,
  onUpdateReconstruction,
  playerId,
  players,
  lockedPlayerIds,
  isHost,
  highlights = [],
  trustPoints = 0,
  onPlayAgain
}) {

  const isMobile = useMediaQuery('(max-width: 768px)');

  // FINAL RECONSTRUCTION
  if (status === 'final_reconstruction') {
    const handleFieldChange = (field, value) => {
      onUpdateReconstruction({
        ...reconstruction,
        [field]: value
      });
    };

    return (
      <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '10px' : '16px' }}>
          <h3 className="font-display" style={{ fontSize: isMobile ? '1.8rem' : '3rem', fontWeight: '400', color: '#ffffff' }}>Final Reconstruction</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '4px auto 0 auto', fontSize: isMobile ? '0.65rem' : '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.4' }}>
            Coordinate to build the communal case file. Any investigator can edit. Changes sync instantly.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 280px', gap: isMobile ? '12px' : '20px', flex: 1 }}>
          {/* Main Form Dossier Card */}
          <div className="surface" style={{ padding: isMobile ? '16px' : '24px', backgroundColor: 'var(--bg-surface)' }}>
            <h4 style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: isMobile ? '16px' : '24px', color: 'var(--text-secondary)' }}>
              INCIDENT TIMELINE PROFILE
            </h4>

            <div className="flex-col" style={{ gap: isMobile ? '10px' : '14px' }}>
              {[
                { field: 'who', label: 'WHO (Suspect)', placeholder: 'Suspect identity...' },
                { field: 'where', label: 'WHERE (Location)', placeholder: 'Scene location...' },
                { field: 'when', label: 'WHEN (Timestamp)', placeholder: 'Incident timing...', tech: true },
                { field: 'how', label: 'HOW (Method)', placeholder: 'Modus operandi...' },
                { field: 'why', label: 'WHY (Motive)', placeholder: 'Perpetrator motive...' }
              ].map(({ field, label, placeholder, tech }) => (
                <div key={field} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '130px 1fr', gap: isMobile ? '4px' : '12px', alignItems: isMobile ? 'stretch' : 'center' }}>
                  <span style={{ fontSize: isMobile ? '0.65rem' : '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{label}</span>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={reconstruction[field] || ''}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    style={tech ? { fontFamily: 'var(--font-tech)' } : {}}
                  />
                </div>
              ))}

              {/* Evidence notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                <span style={{ fontSize: isMobile ? '0.65rem' : '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Supporting Evidence Dossier Notes</span>
                <textarea
                  placeholder="Aggregate corroborating board evidence findings..."
                  value={reconstruction.evidenceNotes || ''}
                  onChange={(e) => handleFieldChange('evidenceNotes', e.target.value)}
                  rows={isMobile ? 2 : 3}
                  style={{ resize: 'none', fontSize: isMobile ? '0.75rem' : '0.8rem' }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar Guidelines */}
          {!isMobile && (
            <div className="flex-col" style={{ gap: '12px' }}>
              <div className="surface-raised" style={{ padding: '18px', backgroundColor: 'var(--bg-surface)' }}>
                <h4 style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  COOPERATIVE METRIC
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  The team receives Trust points based on how many timeline fields match the Ground Truth.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: '600' }}>
                  <ShieldCheck size={14} />
                  <span>Max 100 Pts Target</span>
                </div>
              </div>

              <div className="surface-raised" style={{ padding: '18px', backgroundColor: 'var(--bg-surface)' }}>
                <h4 style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--text-muted)' }}>
                  CONSENSUS METHOD
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Make sure the case file represents the collective team consensus. The file locks automatically when the timer expires.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // SCORING & RECAP
  return (
    <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '20px' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 280px', gap: isMobile ? '12px' : '20px' }}>
        
        {/* Scorecard Table */}
        <div className="surface" style={{ padding: isMobile ? '14px' : '24px', backgroundColor: 'var(--bg-surface)', overflowX: 'auto' }}>
          <h3 style={{ fontSize: isMobile ? '0.75rem' : '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Award size={16} style={{ color: 'var(--accent-purple)' }} />
            Investigator Standings
          </h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: isMobile ? '0.65rem' : '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                <th style={{ padding: '8px 0', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Investigator</th>
                <th style={{ padding: '8px 0', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confidence Bet</th>
                <th style={{ padding: '8px 0', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delta</th>
                <th style={{ padding: '8px 0', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</th>
                {!isMobile && <th style={{ padding: '8px 0', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rating</th>}
              </tr>
            </thead>
            <tbody>
              {players.map((player) => {
                const isMe = player.id === playerId;
                const wasCorrect = player.currentLock ? player.currentLock.isCorrect : false;
                
                return (
                  <tr
                    key={player.id}
                    style={{
                      borderBottom: '1px solid var(--border-glass)',
                      backgroundColor: isMe ? 'rgba(124, 58, 237, 0.03)' : 'transparent',
                      fontWeight: isMe ? '600' : '400'
                    }}
                  >
                    <td style={{ padding: '8px 8px 8px 0', color: isMe ? '#ffffff' : 'var(--text-primary)' }}>
                      {player.name}
                    </td>
                    <td style={{ padding: '8px 0' }}>
                      {player.currentLock ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '600', color: wasCorrect ? 'var(--color-success)' : 'var(--color-danger)' }}>
                            {player.currentStake}
                          </span>
                          <span style={{ fontSize: isMobile ? '0.55rem' : '0.65rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: isMobile ? '80px' : '160px' }}>
                            &ldquo;{player.currentLock.text}&rdquo;
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>None</span>
                      )}
                    </td>
                    <td className="font-tech" style={{ padding: '8px 0', fontWeight: '700', color: player.lastScoreDelta > 0 ? 'var(--color-success)' : player.lastScoreDelta < 0 ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                      {player.lastScoreDelta > 0 ? `+${player.lastScoreDelta}` : player.lastScoreDelta}
                    </td>
                    <td className="font-tech" style={{ padding: '8px 0', fontWeight: '700', color: '#ffffff' }}>
                      {player.score}
                    </td>
                    {!isMobile && (
                      <td className="font-tech" style={{ padding: '8px 0', color: 'var(--accent-purple)', fontWeight: '600' }}>
                        {player.detectiveRating}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Collective Trust points */}
        <div className="flex-col" style={{ gap: '12px' }}>
          <div className="surface-raised" style={{ padding: isMobile ? '16px' : '20px', textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
            <span style={{ fontSize: isMobile ? '0.6rem' : '0.65rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-success)' }}>TEAM TRUST METRIC</span>
            <h3 className="font-display" style={{ fontSize: isMobile ? '2.2rem' : '3rem', fontWeight: '400', margin: '4px 0', color: 'var(--color-success)' }}>{trustPoints}%</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Reconstruction Accuracy</span>
            
            <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', marginTop: '12px' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: isMobile ? '18px' : '24px',
                    height: '3px',
                    borderRadius: '1px',
                    backgroundColor: i < (trustPoints / 20) ? 'var(--color-success)' : 'rgba(255,255,255,0.03)'
                  }}
                />
              ))}
            </div>
          </div>

          <div className="surface-raised" style={{ padding: isMobile ? '12px' : '16px', backgroundColor: 'var(--bg-surface)', fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
            <h4 style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Locked Case Timeline
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-secondary)' }}>
              <div><strong>WHO:</strong> {reconstruction.who || 'N/A'}</div>
              <div><strong>WHERE:</strong> {reconstruction.where || 'N/A'}</div>
              <div><strong>WHEN:</strong> {reconstruction.when || 'N/A'}</div>
              <div><strong>HOW:</strong> {reconstruction.how || 'N/A'}</div>
              <div><strong>WHY:</strong> {reconstruction.why || 'N/A'}</div>
            </div>
          </div>
        </div>

      </div>

      {/* Signature Highlight Moments */}
      <div className="surface" style={{ padding: isMobile ? '14px' : '20px', backgroundColor: 'var(--bg-surface)' }}>
        <h4 style={{ fontSize: isMobile ? '0.65rem' : '0.75rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={14} />
          Case Report Highlights
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '100%' : '240px'}, 1fr))`, gap: isMobile ? '8px' : '12px' }}>
          {highlights && highlights.length > 0 ? (
            highlights.map((highlight, idx) => {
              const isHero = highlight.type === 'hero';
              const isBlunder = highlight.type === 'blunder';
              
              return (
                <div
                  key={idx}
                  className="surface-raised animate-fade-in"
                  style={{
                    padding: isMobile ? '10px 12px' : '12px 16px',
                    backgroundColor: isHero
                      ? 'var(--color-success-dim)'
                      : isBlunder
                      ? 'var(--color-danger-dim)'
                      : 'rgba(255,255,255,0.01)',
                    borderLeft: `2px solid ${isHero ? 'var(--color-success)' : isBlunder ? 'var(--color-danger)' : 'var(--text-muted)'}`
                  }}
                >
                  <p style={{ fontSize: isMobile ? '0.7rem' : '0.8rem', lineHeight: '1.4', color: 'var(--text-primary)' }}>
                    {highlight.text}
                  </p>
                </div>
              );
            })
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No highlights recorded.</div>
          )}
        </div>
      </div>

      {/* Play Again Controls */}
      {isHost ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          <button
            onClick={onPlayAgain}
            className="btn-primary"
            style={{
              padding: isMobile ? '8px 16px' : '10px 24px',
              fontSize: isMobile ? '0.8rem' : '0.85rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RotateCcw size={14} />
            Host Next Case
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '10px', color: 'var(--text-muted)', fontSize: isMobile ? '0.7rem' : '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Awaiting next case initialization from Host...
        </div>
      )}

    </div>
  );
}

export default Recap;
import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, AlertCircle, Radio } from 'lucide-react';

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

function Testimony({ status, players, testimonySpeakerIdx, playerId, privateHand }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const currentSpeaker = players[testimonySpeakerIdx];
  const isMeSpeaker = currentSpeaker?.id === playerId;

  if (status === 'opening_statements') {
    return (
      <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '10px 0' : '20px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '20px' : '32px' }}>
          <h3 className="font-display" style={{ fontSize: isMobile ? '1.8rem' : '3rem', fontWeight: '400', color: '#ffffff' }}>Opening Statements</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '4px auto 0 auto', fontSize: isMobile ? '0.65rem' : '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.4' }}>
            Each detective has a 20-second window to present their recollections.
          </p>
        </div>

        <div
          className="surface-raised"
          style={{
            maxWidth: '560px',
            width: '100%',
            padding: isMobile ? '20px' : '36px',
            textAlign: 'center',
            borderColor: isMeSpeaker ? 'var(--accent-purple)' : 'var(--border-glass)',
            position: 'relative'
          }}
        >
          {currentSpeaker && (
            <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={12} style={{ color: 'var(--color-success)' }} />
              <span className="font-tech" style={{ fontSize: '0.6rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--color-success)' }}>RECORDING</span>
            </div>
          )}

          <div style={{
            width: isMobile ? '44px' : '64px',
            height: isMobile ? '44px' : '64px',
            borderRadius: '50%',
            backgroundColor: isMeSpeaker ? 'var(--accent-purple-dim)' : 'rgba(255, 255, 255, 0.01)',
            border: isMeSpeaker ? '1px solid var(--accent-purple)' : '1px solid var(--border-glass)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            color: isMeSpeaker ? 'var(--accent-purple)' : 'var(--text-muted)'
          }}>
            {isMeSpeaker ? <Volume2 size={isMobile ? 18 : 24} /> : <VolumeX size={isMobile ? 18 : 24} />}
          </div>

          <h2 className="font-display" style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: '400', marginBottom: '6px', color: '#ffffff' }}>
            {currentSpeaker ? currentSpeaker.name : 'Awaiting Speaker...'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '0.75rem' : '0.85rem', marginBottom: '20px' }}>
            {isMeSpeaker ? "You have the floor. Present your memory hand details." : "Analyze the statement. Cross-reference with your hand."}
          </p>

          {isMeSpeaker ? (
            <div className="surface" style={{ padding: isMobile ? '12px' : '16px', backgroundColor: 'rgba(0, 0, 0, 0.1)', textAlign: 'left' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Your Facts:</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {privateHand.map((fact, idx) => (
                  <div key={fact.id || idx} style={{ fontSize: '0.8rem', padding: '6px 10px', background: 'rgba(0, 0, 0, 0.15)', borderRadius: '4px', borderLeft: '2px solid var(--accent-purple)', color: 'var(--text-primary)' }}>
                    <strong style={{ textTransform: 'uppercase', fontSize: '0.65rem', color: 'var(--text-muted)', marginRight: '6px' }}>{fact.category}:</strong> &ldquo;{fact.text}&rdquo;
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
              Feed muted. Waiting for timeline advance.
            </div>
          )}
        </div>

        {/* Players queue visualizer - scrollable on mobile */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '24px', overflowX: 'auto', maxWidth: isMobile ? '95%' : '80%', paddingBottom: '6px' }}>
          {players.map((p, idx) => {
            const isSpeaker = idx === testimonySpeakerIdx;
            const isPast = idx < testimonySpeakerIdx;

            return (
              <div
                key={p.id}
                className="surface"
                style={{
                  padding: isMobile ? '4px 8px' : '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: isSpeaker ? 'var(--accent-purple-dim)' : 'transparent',
                  borderColor: isSpeaker ? 'var(--border-accent)' : 'var(--border-glass)',
                  opacity: isPast ? 0.35 : 1,
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <span style={{ fontSize: isMobile ? '0.7rem' : '0.8rem', fontWeight: '500', color: isSpeaker ? '#ffffff' : 'var(--text-secondary)' }}>
                  {isMobile && p.name.length > 6 ? p.name.substring(0, 5) + '…' : p.name}
                </span>
                {isSpeaker && <span className="font-tech" style={{ fontSize: '0.55rem', color: 'var(--accent-purple)', fontWeight: '700' }}>LIVE</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Cross-Talk open discussion
  return (
    <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '10px 0' : '20px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: isMobile ? '20px' : '32px' }}>
        <h3 className="font-display" style={{ fontSize: isMobile ? '1.8rem' : '3rem', fontWeight: '400', color: '#ffffff' }}>Open Discussion</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '4px auto 0 auto', fontSize: isMobile ? '0.65rem' : '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.4' }}>
          Floor open. All feeds active. Compare recall files.
        </p>
      </div>

      <div className="surface" style={{ maxWidth: '640px', width: '100%', padding: isMobile ? '16px' : '28px', backgroundColor: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '16px' }}>
          <span className="font-tech" style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--color-success)' }}>DISCUSS FLOOR ACTIVE</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '70px' : '110px'}, 1fr))`, gap: isMobile ? '6px' : '10px', margin: isMobile ? '10px 0 16px 0' : '16px 0 24px 0' }}>
          {players.map((p) => {
            const isMe = p.id === playerId;
            return (
              <div
                key={p.id}
                className="surface-raised"
                style={{
                  padding: isMobile ? '8px' : '12px',
                  backgroundColor: 'rgba(0,0,0,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <div style={{
                  width: isMobile ? '24px' : '28px',
                  height: isMobile ? '24px' : '28px',
                  borderRadius: '50%',
                  backgroundColor: isMe ? 'var(--accent-purple)' : 'rgba(255,255,255,0.01)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border-glass)',
                  color: isMe ? '#ffffff' : 'var(--color-success)'
                }}>
                  <Volume2 size={10} />
                </div>
                <span style={{ fontSize: isMobile ? '0.6rem' : '0.75rem', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>
                  {isMobile && p.name.length > 8 ? p.name.substring(0, 6) + '…' : p.name}
                </span>
              </div>
            );
          })}
        </div>

        <div className="surface-raised" style={{ padding: isMobile ? '10px 14px' : '14px 18px', backgroundColor: 'rgba(245, 158, 11, 0.02)', borderLeft: '3px solid var(--color-warning)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <AlertCircle size={14} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: '1px' }} />
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontSize: isMobile ? '0.65rem' : '0.75rem', fontWeight: '700', color: 'var(--color-warning)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>CONTRADICTION PROTOCOL</h4>
            <p style={{ fontSize: isMobile ? '0.7rem' : '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginTop: '2px' }}>
              If a statement conflicts directly with your recall file, lodge an Objection to claim priority and focus the table's attention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Testimony;
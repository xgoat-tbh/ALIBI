import React from 'react';
import { X, Skull, Swords, Zap, Trophy, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export function RulesModal({ onClose }) {
  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="animate-scale-in"
        style={{
          maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
          background: 'var(--bg-floating)', border: '1px solid var(--border-glass-bright)',
          borderRadius: '8px', padding: '28px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} style={{ color: 'var(--color-warning)' }} />
            ALIBI: ACCUSATION
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
          <strong style={{ color: 'var(--color-warning)' }}>Trust no one.</strong> Each player receives fragments of a crime scene memory — some true, some planted. Work together to reconstruct the truth... but one of you is a <strong style={{ color: 'var(--color-danger)' }}>SABOTEUR</strong> working to bury it.
        </div>

        <div style={{ background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.2)', borderRadius: '6px', padding: '12px 14px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <Skull size={18} style={{ color: 'var(--color-danger)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-danger)', marginBottom: '4px' }}>The Saboteur</h4>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              One player (4+ games) is secretly the Saboteur. They know the truth but must steer the group to a wrong reconstruction. The Saboteur scores when you get it <strong style={{ color: 'var(--color-danger)' }}>wrong</strong>. The final reveal unmasks them.
            </p>
          </div>
        </div>

        <h3 style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px', color: 'var(--accent-purple)' }}>
          <Swords size={12} style={{ display: 'inline', marginRight: '4px' }} />
          Fast-Paced Rounds
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '16px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', gap: '8px' }}><span className="font-tech" style={{ color: 'var(--accent-purple)', flexShrink: 0 }}>8s</span><span><strong style={{ color: 'var(--text-primary)' }}>CASE BRIEFING</strong> — Read the crime. Get hyped. Timer is short.</span></div>
          <div style={{ display: 'flex', gap: '8px' }}><span className="font-tech" style={{ color: 'var(--accent-purple)', flexShrink: 0 }}>15s</span><span><strong style={{ color: 'var(--text-primary)' }}>MEMORY SCRAMBLE</strong> — Study your 4 fragments. One is guaranteed true. Memorize fast.</span></div>
          <div style={{ display: 'flex', gap: '8px' }}><span className="font-tech" style={{ color: 'var(--accent-purple)', flexShrink: 0 }}>10s/p</span><span><strong style={{ color: 'var(--text-primary)' }}>TESTIMONY</strong> — Each witness gets 10 seconds to state their case. No time to stall.</span></div>
          <div style={{ display: 'flex', gap: '8px' }}><span className="font-tech" style={{ color: 'var(--accent-purple)', flexShrink: 0 }}>45s</span><span><strong style={{ color: 'var(--text-primary)' }}>CROSS-EXAM</strong> — Accuse, deflect, object. Call out contradictions live.</span></div>
          <div style={{ display: 'flex', gap: '8px' }}><span className="font-tech" style={{ color: 'var(--accent-purple)', flexShrink: 0 }}>90s</span><span><strong style={{ color: 'var(--text-primary)' }}>BOARD CHAOS</strong> — Slam facts onto the board. Challenge suspicious cards. Build the timeline fast.</span></div>
          <div style={{ display: 'flex', gap: '8px' }}><span className="font-tech" style={{ color: 'var(--accent-purple)', flexShrink: 0 }}>20s</span><span><strong style={{ color: 'var(--text-primary)' }}>CONFIDENCE LOCK</strong> — Go public with your stakes. Chickening out? Everyone will know.</span></div>
          <div style={{ display: 'flex', gap: '8px' }}><span className="font-tech" style={{ color: 'var(--accent-purple)', flexShrink: 0 }}>45s</span><span><strong style={{ color: 'var(--text-primary)' }}>RECONSTRUCTION</strong> — Fill in the case file. Saboteur tries to steer it wrong.</span></div>
          <div style={{ display: 'flex', gap: '8px' }}><span className="font-tech" style={{ color: 'var(--accent-purple)', flexShrink: 0 }}>20s</span><span><strong style={{ color: 'var(--text-primary)' }}>THE VERDICT</strong> — Category by category. Ground truth revealed. Who lied?</span></div>
        </div>

        <h3 style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--color-warning)' }}>
          <Trophy size={12} style={{ display: 'inline', marginRight: '4px' }} />
          Scoring & Stakes
        </h3>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
          <strong>Public Stake Tiers:</strong> Everyone sees YOUR bet. No hiding.<br />
          <span style={{ color: 'var(--text-muted)' }}>HUNCH</span>: +10 correct / 0 wrong — safe, boring.<br />
          <span style={{ color: 'var(--color-warning)' }}>CONFIDENT</span>: +25 / -10 — moderate risk, moderate reward.<br />
          <span style={{ color: 'var(--color-danger)' }}>CERTAIN</span>: +50 / -25 — big dick energy or utter humiliation.<br />
          <strong style={{ color: 'var(--color-success)' }}>Minority Report:</strong> +20 if you were right when everyone else was wrong.<br />
          <strong style={{ color: 'var(--color-danger)' }}>Saboteur Payout:</strong> The traitor scores for each category the group gets WRONG.
        </div>

        <h3 style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--color-success)' }}>
          <Eye size={12} style={{ display: 'inline', marginRight: '4px' }} />
          Pro Tips
        </h3>
        <ul style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.6', paddingLeft: '16px', margin: 0 }}>
          <li>One of your 4 facts is an <strong>Anchor</strong> — guaranteed 100% true. Guard it.</li>
          <li>The Saboteur also has an Anchor. They know the truth. Watch for who avoids facts.</li>
          <li>If a board card is challenged and the placer stalls, they're hiding something.</li>
          <li>Going <strong style={{ color: 'var(--color-danger)' }}>CERTAIN</strong> and being wrong is the ultimate shame. Highlights are forever.</li>
          <li>The Saboteur wants wrong answers in the reconstruction. If someone pushes weird choices, call them out.</li>
          <li>Timer pressure is intentional. Hesitation = suspicion. Act fast.</li>
        </ul>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button onClick={onClose} className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.85rem' }}>
            Enter the Case
          </button>
        </div>
      </div>
    </div>
  );
}

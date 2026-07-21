import React from 'react';
import { X, Brain, Users, Trophy, Skull, Zap, Link2 } from 'lucide-react';

export function RulesModal({ onClose }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', padding: '20px' }} onClick={onClose}>
      <div className="animate-scale-in" style={{ maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-floating)', border: '1px solid var(--border-glass-bright)', borderRadius: '8px', padding: '28px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} style={{ color: 'var(--color-warning)' }} />
            How to Play LINKED
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}><X size={16} /></button>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
          A word appears. You type the <strong style={{ color: 'var(--text-primary)' }}>first word that comes to mind</strong>. Then you see who thought the same thing — and who thought something completely different.
        </div>

        <h3 style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px', color: 'var(--accent-primary)' }}>
          <Brain size={12} style={{ display: 'inline', marginRight: '4px' }} />
          8 Rounds — 12 Seconds Each
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <Link2 size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />
            <span>A <strong style={{ color: '#ffffff' }}>prompt word</strong> appears center screen. Everyone sees the same word.</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <Zap size={14} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: '2px' }} />
            <span>Type the <strong style={{ color: '#ffffff' }}>first word you associate</strong> with it. You have 12 seconds. No overthinking.</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <Users size={14} style={{ color: 'var(--color-match)', flexShrink: 0, marginTop: '2px' }} />
            <span>Results reveal who matched (typed similar words) and who went solo.</span>
          </div>
        </div>

        <h3 style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--color-warning)' }}>
          <Trophy size={12} style={{ display: 'inline', marginRight: '4px' }} />
          Scoring
        </h3>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
          <span style={{ color: 'var(--color-match)' }}>HIVE MIND (3+ match)</span>: +15 each — great minds think alike.<br />
          <span style={{ color: 'var(--color-warning)' }}>PAIR (2 match)</span>: +5 each — you found your twin.<br />
          <span style={{ color: 'var(--color-unique)' }}>LONE WOLF (no match)</span>: +10 — you're on another wavelength.<br />
          <span style={{ color: 'var(--color-danger)' }}>REPEATING THE PROMPT</span>: 0 points — boring!
        </div>

        <h3 style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--color-success)' }}>Winner / Loser</h3>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
          <strong style={{ color: 'var(--color-warning)' }}>Highest score after 8 rounds</strong> is Crowned.<br />
          <strong style={{ color: 'var(--color-danger)' }}>Lowest score</strong> gets the permanent <Skull size={10} style={{ display: 'inline' }} /> -1 L badge. There is no escape.
        </div>

        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
          <strong>Typo protection:</strong> Similar words are grouped together (e.g. "happi" and "happy" count as a match). No lying possible — you just type what comes to mind.
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button onClick={onClose} className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.85rem' }}>Got it</button>
        </div>
      </div>
    </div>
  );
}

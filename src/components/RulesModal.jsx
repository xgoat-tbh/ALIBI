import React from 'react';
import { X } from 'lucide-react';

const phases = [
  'CASE FILE OPEN — Review the case scenario',
  'PRIVATE MEMORY — Study your 4 memory fragments (1 is 100% correct)',
  'OPENING STATEMENTS — Each witness presents their hand aloud',
  'CROSS-TALK — Free discussion. Objection! button available',
  'INVESTIGATION BOARD — Place facts on the board, build the timeline',
  'CONFIDENCE LOCK — Bet your score on one fact (Hunch/Confident/Certain)',
  'FINAL RECONSTRUCTION — Fill in WHO, WHERE, WHEN, HOW, WHY together',
  'REVEAL — The ground truth is unveiled category by category',
  'RECAP — Scores calculated, highlights shown, play again'
];

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
          <h2 style={{ fontSize: '1rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            How to Play
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
          ALIBI is a cooperative deduction game. Each player receives 4 memory fragments — some true, some fabricated.
          Work together to reconstruct the case file and identify the ground truth.
        </div>

        <h3 style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px', color: 'var(--accent-purple)' }}>
          Game Flow
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
          {phases.map((phase, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'baseline', fontSize: '0.75rem' }}>
              <span className="font-tech" style={{ color: 'var(--accent-purple)', fontWeight: '700', flexShrink: 0, width: '16px' }}>{i + 1}</span>
              <span style={{ color: 'var(--text-primary)' }}>{phase}</span>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--color-warning)' }}>
          Scoring
        </h3>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
          <strong>Team Trust Points:</strong> Up to 100 based on correct reconstruction categories.<br />
          <strong>Individual Stake:</strong> Hunch (+10/0), Confident (+25/-10), Certain (+50/-25).<br />
          <strong>Minority Report:</strong> +20 if most of the table was wrong but you were right.
        </div>

        <h3 style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--color-success)' }}>
          Tips
        </h3>
        <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.6', paddingLeft: '16px', margin: 0 }}>
          <li>One of your 4 facts is guaranteed correct (the Anchor)</li>
          <li>Contradictions on the board mean someone's memory is wrong</li>
          <li>You can challenge any card — the placer must defend it</li>
          <li>Higher stakes = higher risk. Certain is double-edged.</li>
        </ul>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button onClick={onClose} className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.85rem' }}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { User, MapPin, Clock, Eye, Lightbulb, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';

function TruthReveal({ caseData, players, reconstruction, phaseTimer }) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (!caseData || !caseData.groundTruth) return null;

  const gt = caseData.groundTruth;

  const getRevealLevel = () => {
    if (phaseTimer > 20) return 1;
    if (phaseTimer > 15) return 2;
    if (phaseTimer > 10) return 3;
    if (phaseTimer > 5) return 4;
    return 5;
  };

  const revealLevel = getRevealLevel();

  const revealCategories = [
    { id: 'who', label: 'WHO', gtValue: gt.who, guessValue: reconstruction.who, icon: <User size={16} />, level: 1 },
    { id: 'where', label: 'WHERE', gtValue: gt.where, guessValue: reconstruction.where, icon: <MapPin size={16} />, level: 2 },
    { id: 'when', label: 'WHEN', gtValue: gt.when, guessValue: reconstruction.when, icon: <Clock size={16} />, level: 3 },
    { id: 'how', label: 'HOW', gtValue: gt.how, guessValue: reconstruction.how, icon: <Eye size={16} />, level: 4 },
    { id: 'why', label: 'WHY', gtValue: gt.why, guessValue: reconstruction.why, icon: <Lightbulb size={16} />, level: 5 }
  ];

  return (
    <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: isMobile ? '4px 0' : '10px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: isMobile ? '20px' : '32px' }}>
        <span style={{ fontSize: isMobile ? '0.6rem' : '0.7rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>CASE RESOLUTION</span>
        <h3 className="font-display" style={{ fontSize: isMobile ? '1.8rem' : '3rem', fontWeight: '400', marginTop: '4px', color: '#ffffff' }}>Evaluating Ground Truth</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '12px', maxWidth: '780px', width: '100%', margin: '0 auto' }}>
        {revealCategories.map((cat) => {
          const isRevealed = revealLevel >= cat.level;
          const isCorrect = cat.guessValue === cat.gtValue;

          return (
            <div
              className="surface animate-fade-in"
              style={{
                padding: isMobile ? '10px 14px' : '16px 20px',
                border: '1px solid var(--border-glass)',
                opacity: isRevealed ? 1 : 0.2,
                backgroundColor: isRevealed
                  ? isCorrect
                    ? 'rgba(16, 185, 129, 0.01)'
                    : 'rgba(244, 63, 94, 0.01)'
                  : 'rgba(255, 255, 255, 0.01)',
                display: 'grid',
                gridTemplateColumns: isMobile ? 'auto 1fr auto' : 'auto 1.2fr 1.2fr auto',
                alignItems: 'center',
                gap: isMobile ? '10px' : '24px'
              }}
            >
              {/* Category Icon */}
              <div
                style={{
                  width: isMobile ? '28px' : '36px',
                  height: isMobile ? '28px' : '36px',
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

              {/* Category & Ground Truth */}
              <div>
                <span style={{ fontSize: isMobile ? '0.55rem' : '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  {cat.label} (Truth)
                </span>
                {isRevealed ? (
                  <p className="font-display" style={{ fontSize: isMobile ? '1rem' : '1.5rem', fontWeight: '400', color: '#ffffff', marginTop: '1px' }}>
                    {cat.gtValue}
                  </p>
                ) : (
                  <p style={{ fontSize: isMobile ? '0.9rem' : '1.2rem', fontWeight: '700', color: 'var(--text-muted)', marginTop: '2px', letterSpacing: '2px' }}>
                    &bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;
                  </p>
                )}
              </div>

              {/* Group's Reconstruction - hide on mobile if not revealed to save space */}
              {(!isMobile || isRevealed) && (
                <div>
                  <span style={{ fontSize: isMobile ? '0.55rem' : '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                    Deductive Guess
                  </span>
                  {isRevealed ? (
                    <p className="font-display" style={{ fontSize: isMobile ? '0.95rem' : '1.4rem', fontWeight: '400', color: isCorrect ? 'var(--color-success)' : 'var(--color-danger)', marginTop: '1px' }}>
                      {cat.guessValue || 'Unanswered'}
                    </p>
                  ) : (
                    <p style={{ fontSize: isMobile ? '0.85rem' : '1.1rem', fontWeight: '600', color: 'var(--text-muted)', marginTop: '2px', letterSpacing: '2px' }}>
                      &bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;
                    </p>
                  )}
                </div>
              )}

              {/* Result Indicator */}
              <div>
                {isRevealed ? (
                  isCorrect ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)' }}>
                      <CheckCircle2 size={isMobile ? 12 : 16} />
                      {!isMobile && <span style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Accurate</span>}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-danger)' }}>
                      <XCircle size={isMobile ? 12 : 16} />
                      {!isMobile && <span style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Discrepancy</span>}
                    </div>
                  )
                ) : (
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.05em' }}>
                    WAITING
                  </span>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {revealLevel < 5 && (
        <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)', fontSize: isMobile ? '0.65rem' : '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Declassifying next data packet...
        </div>
      )}
    </div>
  );
}

export default TruthReveal;
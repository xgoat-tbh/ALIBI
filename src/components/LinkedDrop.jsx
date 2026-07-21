import React, { useState, useRef, useEffect } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';

function LinkedDrop({ currentPrompt, currentRound, totalRounds, phaseTimer, mySubmission, onSubmitWord }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [input, setInput] = useState(mySubmission || '');
  const [submitted, setSubmitted] = useState(!!mySubmission);
  const inputRef = useRef(null);

  useEffect(() => {
    setInput(mySubmission || '');
    setSubmitted(!!mySubmission);
    if (!mySubmission && currentPrompt) inputRef.current?.focus();
  }, [mySubmission, currentPrompt]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || submitted) return;
    onSubmitWord(input.trim());
    setSubmitted(true);
  };

  return (
    <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '16px' : '32px', gap: isMobile ? '20px' : '32px' }}>
      {/* Round indicator */}
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: isMobile ? '0.6rem' : '0.7rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Round {currentRound} / {totalRounds}
        </span>
      </div>

      {/* Prompt word */}
      <div style={{
        textAlign: 'center',
        padding: isMobile ? '20px 32px' : '32px 48px',
        background: 'rgba(255, 94, 91, 0.06)',
        border: '1px solid rgba(255, 94, 91, 0.2)',
        borderRadius: '12px',
        position: 'relative'
      }}>
        <span style={{ fontSize: isMobile ? '0.55rem' : '0.6rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-primary)', position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-base)', padding: '0 10px' }}>
          PROMPT
        </span>
        <h1 className="font-display" style={{ fontSize: isMobile ? '3rem' : '5rem', fontWeight: '400', color: '#ffffff', lineHeight: '1.1', margin: 0 }}>
          {currentPrompt}
        </h1>
      </div>

      {/* Instruction */}
      <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '0.7rem' : '0.85rem', textAlign: 'center', maxWidth: '360px' }}>
        Type the <strong style={{ color: 'var(--text-primary)' }}>first word</strong> that comes to mind
      </p>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '380px', display: 'flex', gap: '8px' }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Your word..."
          maxLength={30}
          disabled={submitted}
          style={{ flex: 1, textAlign: 'center', fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: '600', letterSpacing: '0.02em' }}
          autoComplete="off"
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={!input.trim() || submitted}
          style={{ padding: isMobile ? '10px 16px' : '12px 20px', fontSize: isMobile ? '0.8rem' : '0.85rem', fontWeight: '600', whiteSpace: 'nowrap' }}
        >
          {submitted ? 'Locked' : 'Submit'}
        </button>
      </form>

      {/* Timer */}
      <div style={{
        fontSize: isMobile ? '0.8rem' : '1rem', fontWeight: '700',
        fontFamily: 'var(--font-tech)', color: phaseTimer <= 3 ? 'var(--color-danger)' : 'var(--text-secondary)'
      }}>
        {phaseTimer}s
      </div>

      {submitted && (
        <div style={{ fontSize: '0.75rem', color: 'var(--color-match)', fontWeight: '600' }}>
          Word locked: {input}
        </div>
      )}
    </div>
  );
}

export default LinkedDrop;

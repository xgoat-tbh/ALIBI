import React, { useState } from 'react';
import { Plus, ArrowRight, User } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useGameStore } from '../store/gameStore';

function LandingPage({ onOpenRules }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [name, setName] = useState('');
  const [inputCode, setInputCode] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    useGameStore.getState().setPlayerName(name.trim());
    useGameStore.getState().socket?.emit('create_room', name.trim());
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!name.trim() || !inputCode.trim()) return;
    useGameStore.getState().setPlayerName(name.trim());
    useGameStore.getState().socket?.emit('join_room', { code: inputCode.trim(), nickname: name.trim() });
  };

  return (
    <div className="animate-fade-in" style={{ height: '100dvh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
      <div className="landing-wrapper" style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: isMobile ? '16px 14px' : '40px',
        maxWidth: isMobile ? '100%' : '820px',
        margin: '0 auto',
        gap: isMobile ? '10px' : '20px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h1 className="font-display" style={{ fontSize: isMobile ? '3.5rem' : '5.5rem', fontWeight: '400', color: '#ffffff', letterSpacing: '0.02em', lineHeight: '1' }}>ALIBI</h1>
          <p className="font-interface" style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: isMobile ? '0.65rem' : '0.75rem', marginTop: '8px', letterSpacing: '0.2em', fontWeight: '600' }}>DEDUCTION WITHOUT DECEPTION.</p>
          <div style={{ width: '28px', height: '1.5px', backgroundColor: 'var(--accent-purple)', marginTop: '12px' }}></div>
        </div>

        <div className="screenshot-panel" style={{ width: '100%', maxWidth: isMobile ? '100%' : '680px', padding: isMobile ? '14px 16px' : '20px 24px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <User size={12} style={{ color: 'var(--accent-purple)' }} />
            <span className="font-tech" style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.1em', fontWeight: '700' }}>CHOOSE INVESTIGATOR PROFILE</span>
          </div>
          <div className="screenshot-input-wrapper">
            <input
              type="text"
              placeholder="Enter investigator signature / name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={15}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '12px' : '24px', width: '100%', maxWidth: isMobile ? '100%' : '820px', margin: '0 auto' }}>
          <div className="screenshot-card" style={isMobile ? { minHeight: '140px', padding: '16px' } : {}}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '16px' }}>
              <div style={{ width: '32px', height: '32px', border: '1px solid rgba(124, 58, 237, 0.25)', backgroundColor: 'var(--accent-purple-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', color: 'var(--accent-purple)' }}>
                <Plus size={16} />
              </div>
              <div>
                <h3 className="font-interface" style={{ fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.1em', color: '#ffffff', marginBottom: '4px' }}>HOST CHAMBER</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', lineHeight: '1.4' }}>
                  Host a new case file. You choose the scenario.
                </p>
              </div>
            </div>
            <button
              onClick={handleCreate}
              className="screenshot-btn screenshot-btn-host"
              disabled={!name.trim()}
            >
              <span>Create Room</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="screenshot-card" style={isMobile ? { minHeight: '140px', padding: '16px' } : {}}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '16px' }}>
              <div style={{ width: '32px', height: '32px', border: '1px solid rgba(16, 185, 129, 0.25)', backgroundColor: 'var(--color-success-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', color: 'var(--color-success)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>
              <div>
                <h3 className="font-interface" style={{ fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.1em', color: '#ffffff', marginBottom: '4px' }}>JOIN CHAMBER</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', lineHeight: '1.4' }}>
                  Enter a room code. Join an ongoing investigation.
                </p>
              </div>

              <div className="screenshot-input-wrapper" style={{ marginTop: '4px' }}>
                <input
                  type="text"
                  placeholder="ROOM CODE"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  style={{ textAlign: 'center', letterSpacing: '4px', fontWeight: '700', fontFamily: 'var(--font-tech)' }}
                />
              </div>
            </div>
            <button
              onClick={handleJoin}
              className="screenshot-btn"
              disabled={!name.trim() || !inputCode.trim()}
            >
              <span>Join Lobby</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Rules link */}
        <div style={{ textAlign: 'center', marginTop: isMobile ? '8px' : '16px' }}>
          <button
            onClick={onOpenRules}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}
            className="hover-brighten"
          >
            How to Play
          </button>
        </div>

        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="font-tech" style={{ color: 'var(--accent-purple)', fontWeight: '700' }}>[</span>
            <span className="font-tech" style={{ fontSize: isMobile ? '0.6rem' : '0.7rem', color: 'rgba(255, 255, 255, 0.7)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>JOIN A CASE, QUESTION EVERYTHING.</span>
            <span className="font-tech" style={{ color: 'var(--accent-purple)', fontWeight: '700' }}>]</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;

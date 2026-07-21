import React, { useState, useEffect } from 'react';
import { Plus, Users, Copy, Check, Shield, ArrowRight, User } from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import { useMediaQuery } from '../hooks/useMediaQuery';

function Lobby({ roomCode, players = [], playerId, isHost, onCreateRoom, onJoinRoom, onStartGame, onToggleReady }) {
  const [name, setName] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('random');
  const [copied, setCopied] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateRoom(name.trim());
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!name.trim() || !inputCode.trim()) return;
    onJoinRoom(inputCode.trim(), name.trim());
  };

  const handleStart = () => {
    onStartGame(selectedTheme);
  };

  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const themeOptions = [
    { value: 'random', label: 'Random Scenario' },
    { value: 'hotel', label: 'The Verrant Hotel Painting Theft' },
    { value: 'museum', label: 'The Royal Museum Diamond Heist' },
    { value: 'deepsea', label: 'The Deepsea Station Biotech Leak' }
  ];

  const getInitials = (userName) => {
    if (!userName) return '?';
    return userName.trim().charAt(0).toUpperCase();
  };

  if (roomCode) {
    return (
      <div className="animate-fade-in" style={{ padding: isMobile ? '20px' : '36px', display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '28px', maxHeight: '100%', overflowY: 'auto', background: 'rgba(7, 8, 10, 0.5)' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>CASE ROOM CODE</span>
          
          <div
            onClick={handleCopyCode}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              padding: '6px 20px',
              marginTop: '6px',
              borderRadius: 'var(--radius-button)',
              transition: 'var(--transition-smooth)'
            }}
            className="hover-bg"
          >
            <h2 className="font-tech" style={{ fontSize: isMobile ? '2.5rem' : '3.5rem', fontWeight: '500', color: '#ffffff', letterSpacing: '0.05em' }}>
              {roomCode}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)' }}>
              {copied ? <Check size={14} style={{ color: 'var(--color-success)' }} /> : <Copy size={14} style={{ color: 'var(--text-muted)' }} />}
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Click room code to copy</span>
        </div>

        <div>
          <h3 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Users size={14} style={{ color: 'var(--accent-purple)' }} />
            Joined Detectives ({players.length}/10)
          </h3>
          
          <div className="flex-col" style={{ gap: '8px' }}>
            {players.map((player) => {
              const isMe = player.id === playerId;
              
              return (
                <div
                  key={player.id}
                  className="surface-raised animate-fade-in"
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: isMe ? 'rgba(124, 58, 237, 0.04)' : 'rgba(255,255,255,0.01)',
                    borderColor: isMe ? 'var(--border-accent)' : 'var(--border-glass)',
                    borderRadius: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: isMobile ? '28px' : '32px',
                      height: isMobile ? '28px' : '32px',
                      borderRadius: '50%',
                      background: isMe ? 'linear-gradient(135deg, #7c3aed, #4c1d95)' : 'linear-gradient(135deg, #2e303b, #15171e)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      color: '#ffffff',
                      border: '1px solid var(--border-glass-raised)'
                    }}>
                      {getInitials(player.name)}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '500', color: isMe ? '#ffffff' : 'var(--text-primary)' }}>
                        {player.name} {isMe && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(You)</span>}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {player.isHost && (
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--accent-purple-dim)',
                        color: 'var(--accent-purple)',
                        border: '1px solid rgba(124, 58, 237, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Shield size={10} />
                        Host
                      </span>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: player.isReady ? 'var(--color-success)' : 'var(--text-muted)', display: 'inline-block' }}></span>
                      <span style={{ fontWeight: '500' }}>{player.isReady ? 'Ready' : 'Waiting'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {isHost ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '1px solid var(--border-glass)', paddingTop: '24px' }}>
            <CustomDropdown
              options={themeOptions}
              value={selectedTheme}
              onChange={setSelectedTheme}
              label="Select Case File Scenario"
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={handleStart}
                className="btn-primary"
                style={{ width: '100%', padding: '12px 20px', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                disabled={players.length < 2 || !players.every(p => p.isReady)}
              >
                Start Investigation
              </button>
              {players.length < 2 && (
                <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', textAlign: 'center' }}>
                  Awaiting witnesses to join (minimum 2)...
                </span>
              )}
              {players.length >= 2 && !players.every(p => p.isReady) && (
                <span style={{ color: 'var(--color-warning)', fontSize: '0.75rem', textAlign: 'center' }}>
                  Waiting for all investigators to ready up...
                </span>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
            <button
              onClick={onToggleReady}
              className={players.find(p => p.id === playerId)?.isReady ? 'btn-secondary' : 'btn-primary'}
              style={{ width: '100%', padding: '10px 20px', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {players.find(p => p.id === playerId)?.isReady ? 'Waiting for Host...' : 'Mark Ready'}
            </button>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              Only the Host can start the investigation.
            </div>
          </div>
        )}
      </div>
    );
  }

  // Pre-Room Setup / Lobby Login View
  return (
    <div className="landing-wrapper animate-fade-in" style={{ maxWidth: isMobile ? '100%' : '820px', margin: '0 auto' }}>

      {/* Center Main Box */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '20px', width: '100%', margin: 'auto 0' }}>
        {/* Title Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h1 className="font-display" style={{ fontSize: isMobile ? '3.5rem' : '5.5rem', fontWeight: '400', color: '#ffffff', letterSpacing: '0.02em', lineHeight: '1' }}>ALIBI</h1>
          <p className="font-interface" style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: isMobile ? '0.65rem' : '0.75rem', marginTop: '8px', letterSpacing: '0.2em', fontWeight: '600' }}>DEDUCTION WITHOUT DECEPTION.</p>
          <div style={{ width: '28px', height: '1.5px', backgroundColor: 'var(--accent-purple)', marginTop: '12px' }}></div>
        </div>

        {/* Name Input */}
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
            <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </div>
          </div>
        </div>

        {/* Double Chamber Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '12px' : '24px', width: '100%', maxWidth: isMobile ? '100%' : '820px', margin: '0 auto' }}>
          {/* Host Chamber Card */}
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

          {/* Join Chamber Card */}
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
                  maxLength={4}
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
      </div>

      {/* Bottom tagline */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="font-tech" style={{ color: 'var(--accent-purple)', fontWeight: '700' }}>[</span>
          <span className="font-tech" style={{ fontSize: isMobile ? '0.6rem' : '0.7rem', color: 'rgba(255, 255, 255, 0.7)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>JOIN A CASE, QUESTION EVERYTHING.</span>
          <span className="font-tech" style={{ color: 'var(--accent-purple)', fontWeight: '700' }}>]</span>
        </div>
      </div>

      <style>{`
        .hover-bg:hover {
          background-color: rgba(255, 255, 255, 0.02) !important;
        }
      `}</style>
    </div>
  );
}

export default Lobby;
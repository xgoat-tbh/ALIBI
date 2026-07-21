import React, { useState } from 'react';
import { Users, Copy, Check, Shield, ArrowRight } from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import { useMediaQuery } from '../hooks/useMediaQuery';

function Lobby({ roomCode, players = [], playerId, isHost, onCreateRoom, onJoinRoom, onStartGame, onToggleReady }) {
  const [selectedTheme, setSelectedTheme] = useState('random');
  const [copied, setCopied] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

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

export default Lobby;

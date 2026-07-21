import React, { useState } from 'react';
import { Users, Copy, Check, LogOut, Bot, Crown, XCircle } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';

function Lobby({ roomCode, players = [], playerId, isHost, onStartGame, onToggleReady, onLeaveRoom, onAddBots, onKickPlayer }) {
  const [copied, setCopied] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = (userName) => {
    if (!userName) return '?';
    return userName.trim().charAt(0).toUpperCase();
  };

  return (
    <div className="animate-fade-in" style={{ padding: isMobile ? '20px' : '36px', display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '28px', maxHeight: '100%', overflowY: 'auto', background: 'rgba(10, 13, 15, 0.5)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>ROOM CODE</span>
        <div onClick={handleCopyCode} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '6px 20px', marginTop: '6px', borderRadius: 'var(--radius-button)', transition: 'var(--transition-smooth)' }} className="hover-bg" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCopyCode(); }} aria-label="Copy room code">
          <h2 className="font-tech" style={{ fontSize: isMobile ? '2.5rem' : '3.5rem', fontWeight: '500', color: '#ffffff', letterSpacing: '0.05em' }}>{roomCode}</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)' }}>
            {copied ? <Check size={14} style={{ color: 'var(--color-success)' }} /> : <Copy size={14} style={{ color: 'var(--text-muted)' }} />}
          </div>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Click room code to copy</span>
      </div>

      <div>
        <h3 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Users size={14} style={{ color: 'var(--accent-primary)' }} />
          Players ({players.length}/10)
        </h3>
        <div className="flex-col" style={{ gap: '8px' }}>
          {players.map((player) => {
            const isMe = player.id === playerId;
            return (
              <div key={player.id} className="surface-raised animate-fade-in" style={{
                padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: isMe ? 'rgba(255, 94, 91, 0.04)' : 'rgba(255,255,255,0.01)',
                borderColor: isMe ? 'var(--border-accent)' : 'var(--border-glass)', borderRadius: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: isMobile ? '28px' : '32px', height: isMobile ? '28px' : '32px', borderRadius: '50%', background: isMe ? 'linear-gradient(135deg, #ff5e5b, #cc3a3a)' : 'linear-gradient(135deg, #2e303b, #15171e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700', color: '#ffffff', border: '1px solid var(--border-glass-raised)' }}>
                    {getInitials(player.name)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: isMe ? '#ffffff' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {player.name} {isMe && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(You)</span>}
                      {player.isBot && <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: '3px', background: 'rgba(255,94,91,0.1)', color: 'var(--accent-primary)', fontWeight: '700' }}>BOT</span>}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {player.isHost && (
                    <span style={{ fontSize: '0.65rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'var(--accent-primary-dim)', color: 'var(--accent-primary)', border: '1px solid rgba(255, 94, 91, 0.2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Crown size={10} /> Host
                    </span>
                  )}
                  {!player.isBot && !player.isHost && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: player.isReady ? 'var(--color-success)' : 'var(--text-muted)', display: 'inline-block' }}></span>
                      <span style={{ fontWeight: '500' }}>{player.isReady ? 'Ready' : 'Waiting'}</span>
                    </div>
                  )}
                  {isHost && !player.isBot && !player.isHost && (
                    <button onClick={() => onKickPlayer?.(player.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }} title={`Remove ${player.name}`} aria-label={`Kick ${player.name}`}>
                      <XCircle size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isHost ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-glass)', paddingTop: '24px' }}>
          {players.length < 10 && (
            <button onClick={() => onAddBots?.(2)} className="btn-secondary" style={{ width: '100%', padding: '8px 14px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} aria-label="Add test bots">
              <Bot size={12} /><span>Add {Math.min(2, 10 - players.length)} Bot{Math.min(2, 10 - players.length) > 1 ? 's' : ''}</span>
            </button>
          )}
          <button onClick={onStartGame} className="btn-primary" style={{ width: '100%', padding: '12px 20px', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }} disabled={players.length < 2 || !players.every(p => p.isReady || p.isBot)}>
            Start Game
          </button>
          {players.length < 2 && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', textAlign: 'center' }}>Need at least 2 players.</span>}
          {players.length >= 2 && !players.every(p => p.isReady || p.isBot) && <span style={{ color: 'var(--color-warning)', fontSize: '0.75rem', textAlign: 'center' }}>Waiting for all players to ready up...</span>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
          <button onClick={onToggleReady} className={players.find(p => p.id === playerId)?.isReady ? 'btn-secondary' : 'btn-primary'} style={{ width: '100%', padding: '10px 20px', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }} aria-label={players.find(p => p.id === playerId)?.isReady ? 'Waiting for host' : 'Mark ready'}>
            {players.find(p => p.id === playerId)?.isReady ? 'Waiting for Host...' : 'Mark Ready'}
          </button>
        </div>
      )}

      <button onClick={onLeaveRoom} className="btn-secondary" style={{ width: '100%', padding: '8px 14px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-muted)', marginTop: '4px' }} aria-label="Leave room">
        <LogOut size={12} /><span>Leave Room</span>
      </button>
    </div>
  );
}

export default Lobby;

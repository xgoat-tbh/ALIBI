import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { playReady, playLockIn, playChat } from '../hooks/useSound';
import Lobby from '../components/Lobby';
import CaseOpen from '../components/CaseOpen';
import PrivateMemory from '../components/PrivateMemory';
import Testimony from '../components/Testimony';
import InvestigationBoard from '../components/InvestigationBoard';
import ConfidenceLock from '../components/ConfidenceLock';
import TruthReveal from '../components/TruthReveal';
import Recap from '../components/Recap';
import { ChatSidebar } from '../components/ChatSidebar';
import { Volume2, VolumeX, ShieldAlert, MessageSquare, AlertCircle, Wifi, WifiOff, Copy, Check, MessageCircle, LogOut } from 'lucide-react';

function GamePage({ onOpenRules }) {
  const { code } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const chatEndRef = useRef(null);
  const [chatInput, setChatInput] = useState('');
  const [joinName, setJoinName] = useState('');

  const store = useGameStore();
  const {
    roomCode, playerId, playerName, status, phaseTimer = 0, isConnected,
    players = [], board = [], caseData, reconstruction, objection,
    testimonySpeakerIdx, lockedPlayerIds = new Set(), chats = [], privateHand = [],
    highlights = [], trustPoints = 0
  } = store;

  const uiStore = useUIStore();
  const { errorMsg, showChatPanel, mobileChatOpen, copied } = uiStore;

  const emit = useCallback((event, data) => {
    if (store.socket) store.socket.emit(event, data);
  }, [store.socket]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats]);

  // Mobile: hide sidebar by default
  useEffect(() => {
    if (isMobile) uiStore.setShowChatPanel(false);
  }, [isMobile]);

  const toggleChat = useCallback(() => {
    if (isMobile) {
      uiStore.setMobileChatOpen(!mobileChatOpen);
    } else {
      uiStore.setShowChatPanel(!showChatPanel);
    }
  }, [isMobile, mobileChatOpen, showChatPanel]);

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!joinName.trim() || !code) return;
    store.setPlayerName(joinName.trim());
    emit('join_room', { code, nickname: joinName.trim() });
  };

  const handleCreateRoom = (name) => {
    store.setPlayerName(name);
    emit('create_room', name);
  };

  const handleStartGame = (themeId) => emit('start_game', { themeId });
  const handleToggleReady = () => { if (!uiStore.isMuted) playReady(); emit('toggle_ready'); };

  const handlePlaceCard = (fact, category, because) => emit('place_card', { fact, category, because });
  const handleRemoveCard = (boardItemId) => emit('remove_card', { boardItemId });
  const handleChallenge = (boardItemId) => emit('challenge_card', { boardItemId });
  const handleRespondChallenge = (boardItemId, explanation) => emit('respond_challenge', { boardItemId, explanation });
  const handleObjection = () => emit('trigger_objection');
  const handleUpdateReconstruction = (recon) => emit('update_reconstruction', { reconstruction: recon });
  const handleLockConfidence = (fact, stake) => { if (!uiStore.isMuted) playLockIn(); emit('lock_confidence', { fact, stake }); };
  const handleHostNextPhase = () => {
    if (window.confirm('Skip to the next phase?')) emit('host_next_phase');
  };
  const handlePlayAgain = () => emit('play_again');

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    if (!uiStore.isMuted) playChat();
    emit('send_chat', { message: chatInput });
    setChatInput('');
  };

  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = roomCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
    uiStore.setCopied(true);
    setTimeout(() => uiStore.setCopied(false), 2000);
  };

  const handleLeaveRoom = () => {
    if (window.confirm('Leave this case room?')) {
      emit('leave_room');
      navigate('/', { replace: true });
    }
  };

  const handleToggleMute = () => {
    uiStore.setMuted(!uiStore.isMuted);
  };

  const isHost = players.find(p => p.id === playerId)?.isHost ?? false;
  const currentSpeaker = players[testimonySpeakerIdx];

  const getPhaseName = () => {
    switch (status) {
      case 'case_open': return 'CASE FILE OPEN';
      case 'private_memory': return 'PRIVATE MEMORY';
      case 'opening_statements': return 'OPENING STATEMENTS';
      case 'cross_talk': return 'CROSS-TALK DISCUSSION';
      case 'investigation': return 'INVESTIGATION BOARD';
      case 'confidence_lock': return 'CONFIDENCE LOCK';
      case 'final_reconstruction': return 'CASE FILE RECONSTRUCTION';
      case 'reveal': return 'EVALUATION REVEAL';
      case 'recap': return 'CASE RECAP';
      default: return 'ALIBI';
    }
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  // ─── Direct URL access: not yet in this room ───
  if (code && roomCode !== code && status === 'lobby') {
    return (
      <div className="animate-fade-in" style={{ height: '100dvh', width: '100vw', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="surface-raised" style={{ maxWidth: '400px', width: '100%', padding: '28px', textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', letterSpacing: '0.05em' }}>Join Room</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
            Entering case room <span className="font-tech" style={{ color: 'var(--accent-purple)' }}>{code}</span>
          </p>
          {errorMsg && (
            <div style={{ padding: '8px 12px', marginBottom: '12px', borderLeft: '3px solid var(--color-danger)', background: 'var(--color-danger-dim)', color: 'var(--color-danger)', fontSize: '0.8rem', borderRadius: '4px' }}>
              {errorMsg}
            </div>
          )}
          <form onSubmit={handleJoinRoom} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              placeholder="Your investigator name..."
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
              maxLength={15}
              autoFocus
            />
            <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem', fontWeight: '600' }} disabled={!joinName.trim()}>
              Enter Room
            </button>
          </form>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="btn-secondary"
            style={{ width: '100%', marginTop: '10px', padding: '8px 14px', fontSize: '0.75rem', color: 'var(--text-muted)' }}
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  // ─── Lobby (room view) ───
  if (status === 'lobby') {
    return (
      <div className="animate-fade-in" style={{ height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
        {errorMsg && (
          <div style={{ position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 2000, padding: '12px 16px', borderLeft: '3px solid var(--color-danger)', background: 'rgba(7, 8, 10, 0.85)', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-danger)', fontSize: '0.85rem', boxShadow: 'var(--shadow-floating)' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}
        <Lobby
          roomCode={roomCode}
          players={players}
          playerId={playerId}
          isHost={isHost}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onStartGame={handleStartGame}
          onToggleReady={handleToggleReady}
          onLeaveRoom={handleLeaveRoom}
        />
      </div>
    );
  }

  // ─── Game Views ───
  return (
    <div className="game-container">
      {!isConnected && (
        <div role="alert" style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          padding: '10px 16px',
          background: 'rgba(220, 38, 38, 0.15)',
          borderBottom: '1px solid rgba(220, 38, 38, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          color: 'var(--color-danger)', fontSize: '0.85rem', fontWeight: '600',
          backdropFilter: 'blur(8px)'
        }}>
          <WifiOff size={16} />
          <span>Connection lost. Reconnecting...</span>
        </div>
      )}
      {/* Header */}
      <header
        style={{
          padding: isMobile ? '10px 12px' : '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
          background: 'rgba(7, 8, 10, 0.6)',
          flexWrap: 'wrap',
          gap: '6px',
          minHeight: isMobile ? 'auto' : '58px'
        }}
      >
        <div className="flex-row" style={{ gap: isMobile ? '8px' : '16px', flex: 1, minWidth: 0 }}>
          <div
            onClick={handleCopyCode}
            style={{
              padding: '4px 8px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-button)',
              border: '1px solid var(--border-glass-raised)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)'
            }}
            className="hover-brighten"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCopyCode(); }}
            aria-label="Copy room code"
          >
            <span className="font-tech" style={{ fontSize: isMobile ? '0.7rem' : '0.8rem', fontWeight: '600', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>{roomCode}</span>
            {copied ? <Check size={10} style={{ color: 'var(--color-success)' }} /> : <Copy size={10} style={{ color: 'var(--text-muted)' }} />}
          </div>
          {!isMobile && <div style={{ height: '20px', width: '1px', backgroundColor: 'var(--border-glass)' }} />}
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: isMobile ? '0.7rem' : '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {getPhaseName()}
            </h2>
            {status === 'opening_statements' && currentSpeaker && !isMobile && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Active Witness: <strong style={{ color: 'var(--accent-purple)' }}>{currentSpeaker.name}</strong> {currentSpeaker.id === playerId && "(You)"}
              </p>
            )}
          </div>
        </div>

        {objection.active && (
          <div className="flex-row animate-fade-in" style={{
            background: 'var(--color-danger-dim)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            padding: isMobile ? '4px 8px' : '6px 14px',
            borderRadius: 'var(--radius-button)'
          }}>
            <ShieldAlert size={isMobile ? 10 : 14} style={{ color: 'var(--color-danger)' }} />
            <span style={{ fontWeight: '600', fontSize: isMobile ? '0.65rem' : '0.8rem', color: 'var(--color-danger)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              OBJECTION: {objection.playerName}
            </span>
          </div>
        )}

        <div className="flex-row" style={{ gap: isMobile ? '6px' : '10px', flexShrink: 0 }}>
          {phaseTimer > 0 && (
            <div role="timer" aria-label={`${phaseTimer} seconds remaining`} className="font-tech" style={{
              background: phaseTimer <= 10 ? 'var(--color-danger-dim)' : 'rgba(255, 255, 255, 0.02)',
              padding: isMobile ? '4px 8px' : '6px 12px',
              borderRadius: 'var(--radius-button)',
              border: '1px solid',
              borderColor: phaseTimer <= 10 ? 'rgba(244, 63, 94, 0.3)' : 'var(--border-glass-raised)',
              fontSize: isMobile ? '0.75rem' : '0.85rem',
              fontWeight: '600',
              color: phaseTimer <= 10 ? 'var(--color-danger)' : 'var(--text-primary)'
            }}>
              {formatTimer(phaseTimer)}
            </div>
          )}

          <button
            onClick={onOpenRules}
            className="btn-secondary"
            style={{ padding: isMobile ? '4px 8px' : '6px 12px', fontSize: '0.75rem' }}
            aria-label="How to Play"
          >
            ?
          </button>

          <button
            onClick={toggleChat}
            className="btn-secondary"
            style={{ padding: isMobile ? '4px 8px' : '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            aria-label={showChatPanel || mobileChatOpen ? 'Close chat' : 'Open chat'}
          >
            <MessageSquare size={12} />
          </button>

          {(status === 'opening_statements' || status === 'cross_talk') && (
            <button
              onClick={handleObjection}
              className="btn-danger"
              style={{ padding: isMobile ? '4px 8px' : '6px 12px', fontSize: isMobile ? '0.65rem' : '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              disabled={objection.active}
              aria-label="Raise objection"
            >
              {isMobile ? 'Obj' : 'Objection'}
            </button>
          )}

          {isHost && status !== 'recap' && (
            <button onClick={handleHostNextPhase} className="btn-secondary" style={{ padding: isMobile ? '4px 8px' : '6px 12px', fontSize: isMobile ? '0.65rem' : '0.8rem', fontWeight: '500' }} aria-label="Skip to next phase">
              Skip
            </button>
          )}

          <button
            onClick={handleToggleMute}
            className="btn-secondary"
            style={{ padding: isMobile ? '4px 8px' : '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            aria-label={uiStore.isMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {uiStore.isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
          </button>

          <button
            onClick={handleLeaveRoom}
            className="btn-secondary"
            style={{ padding: isMobile ? '4px 8px' : '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-danger)' }}
            aria-label="Leave room"
          >
            {!isMobile && <span>Leave</span>}
            <LogOut size={12} />
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: (showChatPanel && !isMobile) ? '1fr 320px' : '1fr',
        flex: 1,
        height: isMobile ? 'calc(100dvh - 48px - 50px)' : 'calc(100vh - 58px - 62px)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <main style={{ padding: isMobile ? '12px' : '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
          {errorMsg && (
            <div style={{
              padding: '8px 12px',
              marginBottom: '12px',
              borderLeft: '3px solid var(--color-danger)',
              background: 'rgba(244, 63, 94, 0.1)',
              color: 'var(--color-danger)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '4px'
            }}>
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {status === 'case_open' && <CaseOpen caseData={caseData} />}
            {status === 'private_memory' && <PrivateMemory privateHand={privateHand} />}
            {(status === 'opening_statements' || status === 'cross_talk') && (
              <Testimony
                status={status}
                players={players}
                testimonySpeakerIdx={testimonySpeakerIdx}
                playerId={playerId}
                privateHand={privateHand}
              />
            )}
            {status === 'investigation' && (
              <InvestigationBoard
                board={board}
                privateHand={privateHand}
                playerId={playerId}
                onPlaceCard={handlePlaceCard}
                onRemoveCard={handleRemoveCard}
                onChallenge={handleChallenge}
                onRespondChallenge={handleRespondChallenge}
              />
            )}
            {status === 'confidence_lock' && (
              <ConfidenceLock
                privateHand={privateHand}
                playerId={playerId}
                lockedPlayerIds={lockedPlayerIds}
                players={players}
                onLockConfidence={handleLockConfidence}
              />
            )}
            {status === 'final_reconstruction' && (
              <Recap
                status={status}
                reconstruction={reconstruction}
                onUpdateReconstruction={handleUpdateReconstruction}
                playerId={playerId}
                players={players}
                lockedPlayerIds={lockedPlayerIds}
                isHost={isHost}
              />
            )}
            {status === 'reveal' && (
              <TruthReveal
                caseData={caseData}
                players={players}
                reconstruction={reconstruction}
                phaseTimer={phaseTimer}
              />
            )}
            {status === 'recap' && (
              <Recap
                status={status}
                players={players}
                reconstruction={reconstruction}
                highlights={highlights || []}
                trustPoints={trustPoints || 0}
                isHost={isHost}
                onPlayAgain={handlePlayAgain}
              />
            )}
          </div>

          {/* Quick Memory Hand Dock */}
          {status !== 'lobby' && status !== 'case_open' && status !== 'private_memory' && status !== 'reveal' && status !== 'recap' && privateHand.length > 0 && (
            <div style={{ padding: isMobile ? '10px 12px' : '16px 20px', marginTop: isMobile ? '12px' : '24px', background: 'rgba(7, 8, 10, 0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: isMobile ? '0.6rem' : '0.7rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>YOUR HAND</span>
                <span style={{ fontSize: isMobile ? '0.55rem' : '0.65rem', color: 'var(--text-muted)' }}>1 is 100% correct</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '140px' : '210px'}, 1fr))`, gap: isMobile ? '6px' : '12px' }}>
                {privateHand.map((fact) => (
                  <div key={fact.id} className="surface-raised" style={{ padding: isMobile ? '6px 10px' : '10px 14px', backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>{fact.category}</span>
                    <p style={{ color: 'var(--text-primary)', fontSize: isMobile ? '0.7rem' : '0.8rem', lineHeight: '1.3' }}>{fact.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Desktop Chat Sidebar */}
        {showChatPanel && !isMobile && (
          <ChatSidebar
            chats={chats}
            playerId={playerId}
            chatInput={chatInput}
            setChatInput={setChatInput}
            handleSendChat={handleSendChat}
            chatEndRef={chatEndRef}
            isMobile={false}
          />
        )}
      </div>

      {/* Mobile Chat Drawer */}
      {isMobile && mobileChatOpen && (
        <ChatSidebar
          chats={chats}
          playerId={playerId}
          chatInput={chatInput}
          setChatInput={setChatInput}
          handleSendChat={handleSendChat}
          chatEndRef={chatEndRef}
          isMobile={true}
          onClose={() => uiStore.setMobileChatOpen(false)}
        />
      )}

      {/* Mobile chat FAB */}
      {isMobile && !mobileChatOpen && status !== 'lobby' && (
        <button
          onClick={() => uiStore.setMobileChatOpen(true)}
          style={{
            position: 'fixed', bottom: '60px', right: '16px', zIndex: 100,
            width: '48px', height: '48px', borderRadius: '50%',
            backgroundColor: 'var(--accent-purple)', color: '#fff',
            border: 'none', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-floating)'
          }}
          aria-label="Open chat"
        >
          <MessageCircle size={20} />
          {chats.length > 0 && (
            <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--color-danger)', fontSize: '0.6rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              {chats.length > 9 ? '9+' : chats.length}
            </span>
          )}
        </button>
      )}

      {/* Footer */}
      <footer style={{
        padding: isMobile ? '6px 12px' : '10px 24px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(7, 8, 10, 0.4)',
        height: isMobile ? 'auto' : '62px',
        minHeight: isMobile ? '42px' : '62px',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', gap: isMobile ? '6px' : '12px', overflowX: 'auto', flex: 1, alignItems: 'center', paddingBottom: isMobile ? '4px' : 0 }}>
          {!isMobile && (
            <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', borderRight: '1px solid var(--border-glass)', paddingRight: '12px', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>INVESTIGATORS</span>
          )}
          {players.map((p) => {
            const isMe = p.id === playerId;
            const isSpeaker = status === 'opening_statements' && currentSpeaker?.id === p.id;
            const hasLocked = lockedPlayerIds.has(p.id);
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '3px' : '6px', backgroundColor: isSpeaker ? 'rgba(124, 58, 237, 0.08)' : 'transparent', border: isSpeaker ? '1px solid rgba(124, 58, 237, 0.2)' : '1px solid transparent', padding: isMobile ? '2px 6px' : '4px 10px', borderRadius: 'var(--radius-button)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {status === 'private_memory' || (status === 'opening_statements' && !isSpeaker) ? (
                    <VolumeX size={isMobile ? 10 : 12} style={{ color: 'var(--text-muted)' }} />
                  ) : (
                    <Volume2 size={isMobile ? 10 : 12} style={{ color: 'var(--color-success)' }} />
                  )}
                </div>
                <span style={{ fontSize: isMobile ? '0.65rem' : '0.8rem', fontWeight: isMe ? '700' : '500', color: isMe ? '#ffffff' : 'var(--text-secondary)' }}>
                  {isMobile ? p.name.substring(0, 6) : p.name}
                </span>
                {!isMobile && <span className="font-tech" style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: '600' }}>{p.detectiveRating}</span>}
                {status === 'confidence_lock' && !isMobile && (
                  <span style={{ fontSize: '0.65rem', padding: '2px 4px', borderRadius: '3px', background: hasLocked ? 'var(--color-success-dim)' : 'rgba(255, 255, 255, 0.02)', color: hasLocked ? 'var(--color-success)' : 'var(--text-muted)' }}>
                    {hasLocked ? 'LOCKED' : 'STAKING'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {!isMobile && (
          <div role="status" aria-live="polite" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '24px', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span>{isConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
          </div>
        )}
      </footer>
    </div>
  );
}

export default GamePage;

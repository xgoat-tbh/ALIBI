import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useGameStore } from './store/gameStore';
import Lobby from './components/Lobby';
import CaseOpen from './components/CaseOpen';
import PrivateMemory from './components/PrivateMemory';
import Testimony from './components/Testimony';
import InvestigationBoard from './components/InvestigationBoard';
import ConfidenceLock from './components/ConfidenceLock';
import TruthReveal from './components/TruthReveal';
import Recap from './components/Recap';
import { Volume2, VolumeX, ShieldAlert, Award, MessageSquare, AlertCircle, Copy, Check, X, MessageCircle } from 'lucide-react';
// sound effects removed for debugging

const SOCKET_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin;

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = (e) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);
  return matches;
}

function App() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const chatEndRef = useRef(null);
  const [chatInput, setChatInput] = useState('');

  const store = useGameStore();
  const {
    socket, roomCode, playerId, playerName, status, phaseTimer,
    players, board, caseData, reconstruction, objection,
    testimonySpeakerIdx, lockedPlayerIds, chats, privateHand,
    errorMsg, showChatPanel, mobileChatOpen, copied,
    highlights, trustPoints
  } = store;

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    store.setSocket(newSocket);

    newSocket.on('connect', () => store.setConnected(true));
    newSocket.on('disconnect', () => store.setConnected(false));
    newSocket.on('connect_error', () => store.setError('Connection failed. Retrying...'));

    newSocket.on('room_created', ({ roomCode, playerId, players }) => {
      store.setRoomCreated(roomCode, playerId, players);
    });

    newSocket.on('joined_successfully', ({ roomCode, playerId, players }) => {
      store.setJoined(roomCode, playerId, players);
    });

    newSocket.on('room_updated', (data) => {
      store.setRoomUpdated(data);
    });

    newSocket.on('private_hand', ({ hand }) => {
      store.setPrivateHand(hand);
    });

    newSocket.on('game_error', ({ message }) => {
      store.setError(message);
    });

    newSocket.on('room_cleared', () => {
      store.clearRoom();
    });

    newSocket.on('kicked', () => {
      store.clearRoom();
      store.setError('You were removed from the room.');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats]);

  // Mobile: hide sidebar by default
  useEffect(() => {
    if (isMobile) store.setShowChatPanel(false);
  }, [isMobile]);

  const toggleChat = useCallback(() => {
    if (isMobile) {
      store.setMobileChatOpen(!mobileChatOpen);
    } else {
      store.setShowChatPanel(!showChatPanel);
    }
  }, [isMobile, mobileChatOpen, showChatPanel]);

  // Socket event helpers
  const emit = (event, data) => { if (socket) socket.emit(event, data); };

  const handleCreateRoom = (name) => {
    store.setPlayerName(name);
    emit('create_room', name);
  };

  const handleJoinRoom = (code, name) => {
    store.setPlayerName(name);
    emit('join_room', { code, nickname: name });
  };

  const handleStartGame = (themeId) => {
    emit('start_game', { themeId });
  };
  const handleToggleReady = () => {
    emit('toggle_ready');
  };

  const handlePlaceCard = (fact, category, because) => emit('place_card', { fact, category, because });
  const handleRemoveCard = (boardItemId) => emit('remove_card', { boardItemId });
  const handleChallenge = (boardItemId) => emit('challenge_card', { boardItemId });
  const handleRespondChallenge = (boardItemId, explanation) => emit('respond_challenge', { boardItemId, explanation });
  const handleObjection = () => emit('trigger_objection');
  const handleUpdateReconstruction = (recon) => emit('update_reconstruction', { reconstruction: recon });
  const handleLockConfidence = (fact, stake) => emit('lock_confidence', { fact, stake });
  const handleHostNextPhase = () => emit('host_next_phase');
  const handlePlayAgain = () => emit('play_again');

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    emit('send_chat', { message: chatInput });
    setChatInput('');
  };

  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    store.setCopied(true);
    setTimeout(() => store.setCopied(false), 2000);
  };

  const isHost = players.find(p => p.id === playerId)?.isHost;
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

  // ─── Lobby View ───
  if (status === 'lobby' && !roomCode) {
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
        />
      </div>
    );
  }

  // ─── Game Views ───
  return (
    <div className="game-container">
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
            title="Copy Room Code"
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
            <div className="font-tech" style={{
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
            onClick={toggleChat}
            className="btn-secondary"
            style={{ padding: isMobile ? '4px 8px' : '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            title={showChatPanel || mobileChatOpen ? 'Close chat' : 'Open chat'}
          >
            <MessageSquare size={12} />
          </button>

          {(status === 'opening_statements' || status === 'cross_talk') && (
            <button
              onClick={handleObjection}
              className="btn-danger"
              style={{ padding: isMobile ? '4px 8px' : '6px 12px', fontSize: isMobile ? '0.65rem' : '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              disabled={objection.active}
            >
              {isMobile ? 'Obj' : 'Objection'}
            </button>
          )}

          {isHost && status !== 'recap' && (
            <button onClick={handleHostNextPhase} className="btn-secondary" style={{ padding: isMobile ? '4px 8px' : '6px 12px', fontSize: isMobile ? '0.65rem' : '0.8rem', fontWeight: '500' }}>
              Skip
            </button>
          )}
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
            {status === 'lobby' && roomCode && (
              <Lobby
                roomCode={roomCode}
                players={players}
                playerId={playerId}
                isHost={isHost}
                onStartGame={handleStartGame}
                onToggleReady={handleToggleReady}
              />
            )}
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
          />
        )}
      </div>

      {/* Mobile Chat Drawer */}
      {isMobile && mobileChatOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
          display: 'flex', flexDirection: 'column',
          background: 'rgba(7, 8, 10, 0.85)', backdropFilter: 'blur(12px)'
        }} className="chat-drawer-open">
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-raised)' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <MessageSquare size={14} style={{ color: 'var(--accent-purple)' }} />
              Testimony Log
            </h3>
            <button onClick={() => store.setMobileChatOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
              <X size={18} />
            </button>
          </div>
          <div className="chat-drawer-body" style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {chats.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: '24px' }}>Awaiting statements.</div>
            ) : (
              chats.map((chat) => {
                const isSys = chat.playerId === 'system';
                const isMe = chat.playerId === playerId;
                return (
                  <div key={chat.id} style={{ alignSelf: isSys ? 'center' : isMe ? 'flex-end' : 'flex-start', maxWidth: '90%', display: 'flex', flexDirection: 'column', alignItems: isSys ? 'center' : isMe ? 'flex-end' : 'flex-start' }}>
                    {!isSys && <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '2px', fontWeight: '600' }}>{chat.playerName}</span>}
                    <div style={{ padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem', lineHeight: '1.4', background: isSys ? 'rgba(255, 255, 255, 0.02)' : isMe ? 'var(--accent-purple)' : 'var(--bg-raised)', color: isMe ? '#ffffff' : isSys ? 'var(--text-secondary)' : 'var(--text-primary)', border: '1px solid var(--border-glass)', borderBottomRightRadius: isMe ? '1px' : '6px', borderBottomLeftRadius: !isMe && !isSys ? '1px' : '6px', textAlign: isSys ? 'center' : 'left' }}>{chat.text}</div>
                    <span className="font-tech" style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '2px' }}>{chat.timestamp}</span>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSendChat} style={{ padding: '12px 16px', borderTop: '1px solid var(--border-glass)', backgroundColor: 'var(--bg-raised)' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" placeholder="Record note/testimony..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem', flex: 1 }} autoFocus />
              <button type="submit" className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.8rem', flexShrink: 0 }}>Send</button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile chat FAB */}
      {isMobile && !mobileChatOpen && status !== 'lobby' && (
        <button
          onClick={() => store.setMobileChatOpen(true)}
          style={{
            position: 'fixed', bottom: '60px', right: '16px', zIndex: 100,
            width: '48px', height: '48px', borderRadius: '50%',
            backgroundColor: 'var(--accent-purple)', color: '#fff',
            border: 'none', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-floating)'
          }}
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
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '24px', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
            <span>CONNECTED</span>
          </div>
        )}
      </footer>
    </div>
  );
}

function ChatSidebar({ chats, playerId, chatInput, setChatInput, handleSendChat, chatEndRef }) {
  return (
    <aside style={{ display: 'flex', flexDirection: 'column', background: 'rgba(7, 8, 10, 0.5)', borderLeft: 'none' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <MessageSquare size={14} style={{ color: 'var(--accent-purple)' }} />
          Testimony Log
        </h3>
      </div>
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {chats.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: '24px' }}>Awaiting statements.</div>
        ) : (
          chats.map((chat) => {
            const isSys = chat.playerId === 'system';
            const isMe = chat.playerId === playerId;
            return (
              <div key={chat.id} style={{ alignSelf: isSys ? 'center' : isMe ? 'flex-end' : 'flex-start', maxWidth: '90%', display: 'flex', flexDirection: 'column', alignItems: isSys ? 'center' : isMe ? 'flex-end' : 'flex-start' }}>
                {!isSys && <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '2px', fontWeight: '600' }}>{chat.playerName}</span>}
                <div style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', lineHeight: '1.4', background: isSys ? 'rgba(255, 255, 255, 0.02)' : isMe ? 'var(--accent-purple)' : 'var(--bg-raised)', color: isMe ? '#ffffff' : isSys ? 'var(--text-secondary)' : 'var(--text-primary)', border: '1px solid var(--border-glass)', borderBottomRightRadius: isMe ? '1px' : '6px', borderBottomLeftRadius: !isMe && !isSys ? '1px' : '6px', textAlign: isSys ? 'center' : 'left' }}>{chat.text}</div>
                <span className="font-tech" style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px' }}>{chat.timestamp}</span>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSendChat} style={{ padding: '16px', borderTop: '1px solid var(--border-glass)', backgroundColor: 'var(--bg-raised)' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input type="text" placeholder="Record note/testimony..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.8rem' }} />
          <button type="submit" className="btn-primary" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>Send</button>
        </div>
      </form>
    </aside>
  );
}

export default App;
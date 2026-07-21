import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { useMediaQuery } from '../hooks/useMediaQuery';
import Lobby from '../components/Lobby';
import LinkedDrop from '../components/LinkedDrop';
import LinkedReveal from '../components/LinkedReveal';
import LinkedResults from '../components/LinkedResults';
import { ChatSidebar } from '../components/ChatSidebar';
import { MessageSquare, MessageCircle, LogOut, Wifi, WifiOff, AlertCircle } from 'lucide-react';

function GamePage({ onOpenRules }) {
  const { code } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const chatEndRef = useRef(null);
  const [chatInput, setChatInput] = useState('');
  const [joinName, setJoinName] = useState('');

  const store = useGameStore();
  const { roomCode, playerId, status, phaseTimer = 0, isConnected,
    players = [], chats = [], currentPrompt, currentRound, totalRounds = 8,
    revealGroups = [], standings = [], mySubmission } = store;

  const uiStore = useUIStore();
  const { errorMsg, showChatPanel, mobileChatOpen } = uiStore;

  const emit = useCallback((event, data) => {
    if (store.socket) store.socket.emit(event, data);
  }, [store.socket]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  useEffect(() => {
    if (isMobile) uiStore.setShowChatPanel(false);
  }, [isMobile]);

  const toggleChat = useCallback(() => {
    if (isMobile) uiStore.setMobileChatOpen(!mobileChatOpen);
    else uiStore.setShowChatPanel(!showChatPanel);
  }, [isMobile, mobileChatOpen, showChatPanel]);

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!joinName.trim() || !code) return;
    store.setPlayerName(joinName.trim());
    emit('join_room', { code, nickname: joinName.trim() });
  };

  const handleStartGame = () => emit('start_game');
  const handleToggleReady = () => emit('toggle_ready');
  const handleSubmitWord = (word) => {
    store.setMySubmission(word);
    emit('submit_word', { word });
  };
  const handleHostNextPhase = () => {
    if (window.confirm('Skip to next phase?')) emit('host_next_phase');
  };
  const handlePlayAgain = () => emit('play_again');

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    emit('send_chat', { message: chatInput });
    setChatInput('');
  };

  const handleLeaveRoom = () => {
    if (window.confirm('Leave the room?')) {
      emit('leave_room');
      navigate('/', { replace: true });
    }
  };

  const isHost = players.find(p => p.id === playerId)?.isHost ?? false;

  // Direct URL join
  if (code && roomCode !== code && status === 'lobby') {
    return (
      <div className="animate-fade-in" style={{ height: '100dvh', width: '100vw', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="surface-raised" style={{ maxWidth: '400px', width: '100%', padding: '28px', textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', letterSpacing: '0.05em' }}>Join Room</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
            Entering room <span className="font-tech" style={{ color: 'var(--accent-primary)' }}>{code}</span>
          </p>
          {errorMsg && (
            <div style={{ padding: '8px 12px', marginBottom: '12px', borderLeft: '3px solid var(--color-danger)', background: 'var(--color-danger-dim)', color: 'var(--color-danger)', fontSize: '0.8rem', borderRadius: '4px' }}>{errorMsg}</div>
          )}
          <form onSubmit={handleJoinRoom} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" placeholder="Your name..." value={joinName} onChange={(e) => setJoinName(e.target.value)} maxLength={15} autoFocus />
            <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem', fontWeight: '600' }} disabled={!joinName.trim()}>Enter Room</button>
          </form>
          <button onClick={() => navigate('/', { replace: true })} className="btn-secondary" style={{ width: '100%', marginTop: '10px', padding: '8px 14px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Back</button>
        </div>
      </div>
    );
  }

  // Lobby
  if (status === 'lobby') {
    return (
      <div className="animate-fade-in" style={{ height: '100dvh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
        {errorMsg && (
          <div style={{ position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 2000, padding: '12px 16px', borderLeft: '3px solid var(--color-danger)', background: 'rgba(10, 13, 15, 0.85)', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-danger)', fontSize: '0.85rem', boxShadow: 'var(--shadow-floating)' }}>
            <AlertCircle size={16} /><span>{errorMsg}</span>
          </div>
        )}
        <Lobby roomCode={roomCode} players={players} playerId={playerId} isHost={isHost}
          onStartGame={handleStartGame} onToggleReady={handleToggleReady} onLeaveRoom={handleLeaveRoom}
          onAddBots={(count) => emit('add_bots', { count })} />
      </div>
    );
  }

  // Game views
  return (
    <div style={{ height: '100dvh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'rgba(7, 8, 10, 0.78)', backdropFilter: 'blur(2px)' }}>
      {!isConnected && (
        <div role="alert" style={{ padding: '8px 16px', background: 'rgba(220, 38, 38, 0.15)', borderBottom: '1px solid rgba(220, 38, 38, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--color-danger)', fontSize: '0.85rem', fontWeight: '600', flexShrink: 0 }}>
          <WifiOff size={16} /><span>Connection lost. Reconnecting...</span>
        </div>
      )}

      <header style={{ padding: isMobile ? '10px 12px' : '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, background: 'rgba(10, 13, 15, 0.6)', gap: '6px', flexShrink: 0 }}>
        <h2 style={{ fontSize: isMobile ? '0.7rem' : '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {status === 'word_drop' ? `ROUND ${currentRound} — ASSOCIATE` : status === 'reveal' ? 'RESULTS' : status === 'results' ? 'FINAL STANDINGS' : 'LINKED'}
        </h2>

        <div className="flex-row" style={{ gap: isMobile ? '6px' : '10px', flexShrink: 0 }}>
          {phaseTimer > 0 && (
            <div role="timer" aria-label={`${phaseTimer} seconds remaining`} className="font-tech" style={{
              background: phaseTimer <= 3 ? 'var(--color-danger-dim)' : 'rgba(255,255,255,0.02)',
              padding: isMobile ? '4px 8px' : '6px 12px', borderRadius: 'var(--radius-button)',
              border: '1px solid', borderColor: phaseTimer <= 3 ? 'rgba(255,94,91,0.3)' : 'var(--border-glass-raised)',
              fontSize: isMobile ? '0.75rem' : '0.85rem', fontWeight: '600',
              color: phaseTimer <= 3 ? 'var(--color-danger)' : 'var(--text-primary)'
            }}>{phaseTimer}s</div>
          )}
          <button onClick={onOpenRules} className="btn-secondary" style={{ padding: isMobile ? '4px 8px' : '6px 12px', fontSize: '0.75rem' }} aria-label="Rules">?</button>
          <button onClick={toggleChat} className="btn-secondary" style={{ padding: isMobile ? '4px 8px' : '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} aria-label={showChatPanel || mobileChatOpen ? 'Close chat' : 'Open chat'}>
            <MessageSquare size={12} />
          </button>
          {(status === 'word_drop' || status === 'reveal') && isHost && (
            <button onClick={handleHostNextPhase} className="btn-secondary" style={{ padding: isMobile ? '4px 8px' : '6px 12px', fontSize: isMobile ? '0.65rem' : '0.8rem', fontWeight: '500' }} aria-label="Skip to next phase">Skip</button>
          )}
          <button onClick={handleLeaveRoom} className="btn-secondary" style={{ padding: isMobile ? '4px 8px' : '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-danger)' }} aria-label="Leave room">
            {!isMobile && <span>Leave</span>}
            <LogOut size={12} />
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: (showChatPanel && !isMobile) ? '1fr 320px' : '1fr', flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' }}>
        <main style={{ padding: isMobile ? '12px' : '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
          {errorMsg && (
            <div style={{ padding: '8px 12px', marginBottom: '12px', borderLeft: '3px solid var(--color-danger)', background: 'var(--color-danger-dim)', color: 'var(--color-danger)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '4px' }}>
              <AlertCircle size={14} /><span>{errorMsg}</span>
            </div>
          )}
          {status === 'word_drop' && (
            <LinkedDrop currentPrompt={currentPrompt} currentRound={currentRound} totalRounds={totalRounds} phaseTimer={phaseTimer} mySubmission={mySubmission} onSubmitWord={handleSubmitWord} />
          )}
          {status === 'reveal' && (
            <LinkedReveal revealGroups={revealGroups} currentPrompt={currentPrompt} currentRound={currentRound} totalRounds={totalRounds} />
          )}
          {status === 'results' && (
            <LinkedResults players={players} standings={standings} totalRounds={totalRounds} playerId={playerId} isHost={isHost} onPlayAgain={handlePlayAgain} />
          )}
        </main>
        {showChatPanel && !isMobile && (
          <ChatSidebar chats={chats} playerId={playerId} chatInput={chatInput} setChatInput={setChatInput} handleSendChat={handleSendChat} chatEndRef={chatEndRef} isMobile={false} />
        )}
      </div>

      {isMobile && mobileChatOpen && (
        <ChatSidebar chats={chats} playerId={playerId} chatInput={chatInput} setChatInput={setChatInput} handleSendChat={handleSendChat} chatEndRef={chatEndRef} isMobile={true} onClose={() => uiStore.setMobileChatOpen(false)} />
      )}
      {isMobile && !mobileChatOpen && status !== 'lobby' && (
        <button onClick={() => uiStore.setMobileChatOpen(true)} style={{ position: 'fixed', bottom: '60px', right: '16px', zIndex: 100, width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-floating)' }} aria-label="Open chat">
          <MessageCircle size={20} />
          {chats.length > 0 && (
            <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--color-danger)', fontSize: '0.6rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              {chats.length > 9 ? '9+' : chats.length}
            </span>
          )}
        </button>
      )}

      <footer style={{ padding: isMobile ? '6px 12px' : '8px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10, 13, 15, 0.4)', flexShrink: 0, minHeight: isMobile ? '36px' : '36px' }}>
        <div style={{ display: 'flex', gap: isMobile ? '6px' : '12px', overflowX: 'auto', flex: 1, alignItems: 'center' }}>
          {!isMobile && <span style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', borderRight: '1px solid var(--border-glass)', paddingRight: '12px', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Players</span>}
          {players.map((p) => {
            const isMe = p.id === playerId;
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '3px' : '6px', padding: isMobile ? '2px 6px' : '4px 8px', borderRadius: 'var(--radius-button)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                <span style={{ fontSize: isMobile ? '0.65rem' : '0.75rem', fontWeight: isMe ? '700' : '500', color: isMe ? '#ffffff' : 'var(--text-secondary)' }}>{p.name}</span>
                <span className="font-tech" style={{ fontSize: isMobile ? '0.65rem' : '0.7rem', fontWeight: '700', color: 'var(--accent-primary)' }}>{p.score}</span>
              </div>
            );
          })}
        </div>
        {!isMobile && (
          <div role="status" aria-live="polite" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '24px', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span>{isConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
          </div>
        )}
      </footer>
    </div>
  );
}

export default GamePage;

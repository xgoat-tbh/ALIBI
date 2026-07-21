import { MessageSquare, X, MessageCircle } from 'lucide-react';

function ChatMessage({ chat, isMe }) {
  const isSys = chat.playerId === 'system';
  return (
    <div key={chat.id} style={{
      alignSelf: isSys ? 'center' : isMe ? 'flex-end' : 'flex-start',
      maxWidth: '90%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: isSys ? 'center' : isMe ? 'flex-end' : 'flex-start'
    }}>
      {!isSys && (
        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '2px', fontWeight: '600' }}>
          {chat.playerName}
        </span>
      )}
      <div style={{
        padding: '6px 10px',
        borderRadius: '6px',
        fontSize: '0.8rem',
        lineHeight: '1.4',
        background: isSys ? 'rgba(255, 255, 255, 0.02)' : isMe ? 'var(--accent-purple)' : 'var(--bg-raised)',
        color: isMe ? '#ffffff' : isSys ? 'var(--text-secondary)' : 'var(--text-primary)',
        border: '1px solid var(--border-glass)',
        borderBottomRightRadius: isMe ? '1px' : '6px',
        borderBottomLeftRadius: !isMe && !isSys ? '1px' : '6px',
        textAlign: isSys ? 'center' : 'left'
      }}>
        {chat.text}
      </div>
      <span className="font-tech" style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '2px' }}>
        {chat.timestamp}
      </span>
    </div>
  );
}

export function ChatSidebar({ chats, playerId, chatInput, setChatInput, handleSendChat, chatEndRef, isMobile, onClose }) {
  if (isMobile) {
    return (
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
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>
        <div className="chat-drawer-body" style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {chats.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: '24px' }}>Awaiting statements.</div>
          ) : (
            chats.map((chat) => <ChatMessage key={chat.id} chat={chat} isMe={chat.playerId === playerId} />)
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
    );
  }

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
          chats.map((chat) => <ChatMessage key={chat.id} chat={chat} isMe={chat.playerId === playerId} />)
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

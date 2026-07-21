import React, { useState, useEffect } from 'react';
import { User, MapPin, Clock, Eye, Lightbulb, Shield } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';

function PrivateMemory({ privateHand = [] }) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'who': return <User size={14} style={{ color: 'var(--text-secondary)' }} />;
      case 'where': return <MapPin size={14} style={{ color: 'var(--text-secondary)' }} />;
      case 'when': return <Clock size={14} style={{ color: 'var(--text-secondary)' }} />;
      case 'how': return <Eye size={14} style={{ color: 'var(--text-secondary)' }} />;
      case 'why': return <Lightbulb size={14} style={{ color: 'var(--text-secondary)' }} />;
      default: return <Shield size={14} style={{ color: 'var(--text-secondary)' }} />;
    }
  };

  return (
    <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: isMobile ? '4px 0' : '10px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: isMobile ? '20px' : '32px' }}>
        <h3 className="font-display" style={{ fontSize: isMobile ? '2rem' : '3.2rem', fontWeight: '400', lineHeight: '1.1', color: '#ffffff' }}>Your Recall Dossier</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '8px auto 0 auto', fontSize: isMobile ? '0.7rem' : '0.85rem', lineHeight: '1.5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Below are your personal recollection fragments. Exactly one is guaranteed 100% correct (Anchor). The others might be subtly corrupted or false.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '140px' : '220px'}, 1fr))`, gap: isMobile ? '8px' : '16px', maxWidth: '960px', width: '100%', margin: '0 auto' }}>
        {privateHand.map((fact, idx) => (
          <div
            key={fact.id || idx}
            className="surface-raised"
            style={{
              padding: isMobile ? '12px' : '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: isMobile ? '120px' : '170px',
              backgroundColor: 'var(--bg-surface)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: isMobile ? '8px' : '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px' }}>
                {getCategoryIcon(fact.category)}
                <span style={{ fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  {fact.category}
                </span>
              </div>
              <p style={{ fontSize: isMobile ? '0.8rem' : '0.9rem', lineHeight: '1.5', fontWeight: '400', color: 'var(--text-primary)' }}>
                &ldquo;{fact.text}&rdquo;
              </p>
            </div>
            
            <div style={{ marginTop: isMobile ? '8px' : '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <span className="font-tech" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                FRAG-{(idx + 1).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PrivateMemory;
import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, HelpCircle, Eye } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';

function CaseOpen({ caseData }) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (!caseData) return null;

  return (
    <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60%', padding: isMobile ? '20px 12px' : '40px 20px' }}>
      
      <div style={{ maxWidth: '640px', width: '100%', textAlign: 'center' }}>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass-raised)', borderRadius: '4px', marginBottom: '20px' }}>
          <Eye size={12} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)' }}>CLASSIFIED INCIDENT DOSSIER</span>
        </div>

        <h1 className="font-display" style={{ fontSize: isMobile ? '2.8rem' : '4.5rem', fontWeight: '400', lineHeight: '1.05', color: '#ffffff', letterSpacing: '-0.01em', marginBottom: '16px' }}>
          {caseData.themeTitle}
        </h1>
        
        <p style={{ fontSize: isMobile ? '0.85rem' : '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: isMobile ? '24px' : '40px', fontWeight: '300' }}>
          {caseData.themeDescription}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '10px' : '20px', borderTop: '1px solid var(--border-glass)', paddingTop: isMobile ? '20px' : '32px' }}>
          
          <div style={{ padding: '10px' }}>
            <MapPin size={16} style={{ color: 'var(--text-muted)', margin: '0 auto 8px auto' }} />
            <h4 style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Location</h4>
            <p style={{ fontWeight: '500', fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '4px' }}>Secured Grid</p>
          </div>
          
          <div style={{ padding: '10px' }}>
            <Calendar size={16} style={{ color: 'var(--text-muted)', margin: '0 auto 8px auto' }} />
            <h4 style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Timeline</h4>
            <p style={{ fontWeight: '500', fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '4px' }}>Multiple Records</p>
          </div>
          
          <div style={{ padding: '10px' }}>
            <HelpCircle size={16} style={{ color: 'var(--text-muted)', margin: '0 auto 8px auto' }} />
            <h4 style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Reliability</h4>
            <p style={{ fontWeight: '500', fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '4px' }}>Uncorroborated</p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default CaseOpen;
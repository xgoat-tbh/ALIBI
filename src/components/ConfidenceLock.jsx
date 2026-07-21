import React, { useState, useEffect } from 'react';
import { User, MapPin, Clock, Eye, Lightbulb, Shield, ShieldCheck, Target } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';

function ConfidenceLock({ privateHand = [], playerId, lockedPlayerIds = new Set(), players = [], onLockConfidence }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [selectedFact, setSelectedFact] = useState(null);
  const [selectedStake, setSelectedStake] = useState(null);
  const [acknowledgedLock, setAcknowledgedLock] = useState(false);
  const hasLocked = acknowledgedLock || (lockedPlayerIds && lockedPlayerIds.has(playerId));

  const stakes = [
    {
      id: 'Hunch',
      label: 'HUNCH',
      reward: '+10',
      penalty: '0',
      desc: 'Zero risk, small reward. Good for uncertain recollections.',
      color: 'var(--text-secondary)'
    },
    {
      id: 'Confident',
      label: 'CONFIDENT',
      reward: '+25',
      penalty: '-10',
      desc: 'Moderate risk, medium reward. Confident but careful.',
      color: 'var(--color-warning)'
    },
    {
      id: 'Certain',
      label: 'CERTAIN',
      reward: '+50',
      penalty: '-25',
      desc: 'High risk, massive reward. Lock in the absolute truth.',
      color: 'var(--color-danger)'
    }
  ];

  const handleLockSubmit = () => {
    if (!selectedFact || !selectedStake) return;
    onLockConfidence(selectedFact, selectedStake);
    setAcknowledgedLock(true);
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'who': return <User size={12} />;
      case 'where': return <MapPin size={12} />;
      case 'when': return <Clock size={12} />;
      case 'how': return <Eye size={12} />;
      case 'why': return <Lightbulb size={12} />;
      default: return <Shield size={12} />;
    }
  };

  if (hasLocked) {
    const totalPlayers = players.length;
    const lockedCount = lockedPlayerIds.size;

    return (
      <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '20px 12px' : '40px 20px' }}>
        <div className="surface-raised" style={{ maxWidth: '480px', width: '100%', padding: isMobile ? '24px' : '36px', textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ width: isMobile ? '40px' : '48px', height: isMobile ? '40px' : '48px', borderRadius: '50%', backgroundColor: 'var(--color-success-dim)', border: '1px solid var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: 'var(--color-success)' }}>
            <ShieldCheck size={isMobile ? 16 : 20} />
          </div>

          <h3 style={{ fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confidence Locked</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '0.75rem' : '0.8rem', marginBottom: '20px', lineHeight: '1.4' }}>
            Your bet is registered. Waiting for the remaining investigators to lock their parameters.
          </p>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>
              <span>Locked Investigators</span>
              <span className="font-tech">{lockedCount} / {totalPlayers}</span>
            </div>
            <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${(lockedCount / totalPlayers) * 100}%`, height: '100%', backgroundColor: 'var(--accent-purple)', transition: 'width 0.3s ease' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
            {players.map(p => {
              const locked = lockedPlayerIds.has(p.id);
              return (
                <span
                  key={p.id}
                  style={{
                    fontSize: isMobile ? '0.65rem' : '0.7rem',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: locked ? 'var(--color-success-dim)' : 'rgba(255,255,255,0.01)',
                    color: locked ? 'var(--color-success)' : 'var(--text-muted)',
                    border: locked ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid transparent',
                    fontWeight: '500'
                  }}
                >
                  {p.name}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: isMobile ? '4px 0' : '10px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: isMobile ? '20px' : '32px' }}>
        <h3 className="font-display" style={{ fontSize: isMobile ? '1.8rem' : '3rem', fontWeight: '400', color: '#ffffff' }}>Confidence Lock</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '4px auto 0 auto', fontSize: isMobile ? '0.65rem' : '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.4' }}>
          Select one statement from your hand you are most confident is correct, and choose your stake size.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '16px' : '24px', maxWidth: '960px', width: '100%', margin: '0 auto' }}>
        
        {/* Step 1: Select Fact */}
        <div className="flex-col">
          <span style={{ fontSize: isMobile ? '0.65rem' : '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
            1. Select Fact Card
          </span>
          <div className="flex-col" style={{ gap: isMobile ? '6px' : '8px' }}>
            {privateHand.map((fact) => {
              const isSelected = selectedFact?.id === fact.id;
              return (
                <div
                  key={fact.id}
                  onClick={() => setSelectedFact(fact)}
                  className="surface-raised hover-brighten"
                  style={{
                    padding: isMobile ? '10px 12px' : '14px 16px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'rgba(124, 58, 237, 0.05)' : 'rgba(0,0,0,0.1)',
                    borderColor: isSelected ? 'var(--accent-purple)' : 'var(--border-glass)',
                    borderLeft: `3px solid ${isSelected ? 'var(--accent-purple)' : 'transparent'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{getCategoryIcon(fact.category)}</span>
                    <span style={{ fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      {fact.category}
                    </span>
                  </div>
                  <p style={{ fontSize: isMobile ? '0.75rem' : '0.85rem', lineHeight: '1.4' }}>
                    &ldquo;{fact.text}&rdquo;
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select Stake */}
        <div className="flex-col">
          <span style={{ fontSize: isMobile ? '0.65rem' : '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
            2. Choose Staking Tier
          </span>
          
          <div className="flex-col" style={{ gap: isMobile ? '6px' : '8px' }}>
            {stakes.map((stake) => {
              const isSelected = selectedStake === stake.id;
              return (
                <div
                  key={stake.id}
                  onClick={() => setSelectedStake(stake.id)}
                  className="surface-raised hover-brighten"
                  style={{
                    padding: isMobile ? '10px 12px' : '14px 16px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0,0,0,0.1)',
                    borderColor: isSelected ? stake.color : 'var(--border-glass)',
                    borderLeft: `3px solid ${isSelected ? stake.color : 'transparent'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: isMobile ? '0.8rem' : '0.9rem', fontWeight: '700', color: isSelected ? '#ffffff' : 'var(--text-secondary)' }}>
                      {stake.label}
                    </span>
                    <div style={{ display: 'flex', gap: '4px', fontSize: isMobile ? '0.65rem' : '0.75rem', fontWeight: '600' }} className="font-tech">
                      <span style={{ color: 'var(--color-success)', padding: '2px 4px', background: 'var(--color-success-dim)', borderRadius: '2px' }}>
                        {stake.reward}
                      </span>
                      <span style={{ color: stake.id === 'Hunch' ? 'var(--text-muted)' : 'var(--color-danger)', padding: '2px 4px', background: stake.id === 'Hunch' ? 'rgba(255,255,255,0.02)' : 'var(--color-danger-dim)', borderRadius: '2px' }}>
                        {stake.penalty}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: isMobile ? '0.7rem' : '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4', marginTop: '2px' }}>
                    {stake.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleLockSubmit}
            className="btn-primary"
            style={{
              marginTop: '12px',
              width: '100%',
              padding: isMobile ? '10px 16px' : '12px 20px',
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            disabled={!selectedFact || !selectedStake}
          >
            <Target size={14} />
            Confirm Lock
          </button>
        </div>

      </div>
    </div>
  );
}

export default ConfidenceLock;
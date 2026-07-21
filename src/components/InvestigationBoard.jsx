import React, { useState, useEffect } from 'react';
import { User, MapPin, Clock, Eye, Lightbulb, Shield, AlertTriangle, Check, ArrowRight, Trash2 } from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import { useMediaQuery } from '../hooks/useMediaQuery';

function InvestigationBoard({ board = [], privateHand = [], playerId, onPlaceCard, onRemoveCard, onChallenge, onRespondChallenge }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [selectedFact, setSelectedFact] = useState(null);
  const [becauseText, setBecauseText] = useState('');
  const [placementCategory, setPlacementCategory] = useState('');
  const [challengeExplanation, setChallengeExplanation] = useState('');

  const activeChallengeItem = board.find(i => i.challengeStatus === 'pending');
  const isMeChallenged = activeChallengeItem?.placerId === playerId;

  const categories = [
    { id: 'who', label: 'WHO', icon: <User size={14} /> },
    { id: 'where', label: 'WHERE', icon: <MapPin size={14} /> },
    { id: 'when', label: 'WHEN', icon: <Clock size={14} /> },
    { id: 'how', label: 'HOW', icon: <Eye size={14} /> },
    { id: 'why', label: 'WHY', icon: <Lightbulb size={14} /> },
    { id: 'evidence', label: 'EVIDENCE', icon: <Shield size={14} /> }
  ];

  const handleCardClick = (fact) => {
    const alreadyPlaced = board.some(item => item.factId === fact.id && item.placerId === playerId);
    if (alreadyPlaced) return;

    setSelectedFact(fact);
    setPlacementCategory(fact.category.toLowerCase());
    setBecauseText('');
  };

  const handlePlaceSubmit = (e) => {
    e.preventDefault();
    if (!selectedFact || !becauseText.trim() || !placementCategory) return;
    
    onPlaceCard(selectedFact, placementCategory, becauseText.trim());
    setSelectedFact(null);
    setBecauseText('');
  };

  const handleChallengeSubmit = (e, itemId) => {
    e.preventDefault();
    if (!challengeExplanation.trim()) return;
    onRespondChallenge(itemId, challengeExplanation.trim());
    setChallengeExplanation('');
  };

  const getCategoryColor = (cat) => {
    switch (cat.toLowerCase()) {
      case 'who': return '#8b5cf6';
      case 'where': return '#ec4899';
      case 'when': return '#f59e0b';
      case 'how': return '#3b82f6';
      case 'why': return '#10b981';
      default: return '#9ca3af';
    }
  };

  const categoryDropdownOptions = categories.map(c => ({
    value: c.id,
    label: c.label
  }));

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateRows: '1fr auto', flex: 1, gap: isMobile ? '10px' : '20px', overflow: 'hidden' }}>
      
      {/* Board Canvas Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)',
        gap: isMobile ? '4px' : '8px',
        overflowY: 'auto',
        paddingBottom: isMobile ? '4px' : 0
      }}>
        {categories.map((cat) => {
          const columnItems = board.filter((item) => item.category === cat.id);
          const color = getCategoryColor(cat.id);

          return (
            <div
              key={cat.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid var(--border-glass)',
                borderRadius: '6px',
                minHeight: isMobile ? '140px' : '240px',
                overflow: 'hidden'
              }}
            >
              {/* Column Header */}
              <div
                style={{
                  padding: isMobile ? '6px 8px' : '10px 12px',
                  borderBottom: '1px solid var(--border-glass)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: color,
                  backgroundColor: 'rgba(0, 0, 0, 0.15)'
                }}
              >
                {cat.icon}
                <span style={{ fontSize: isMobile ? '0.6rem' : '0.7rem', fontWeight: '700', letterSpacing: '0.05em' }}>{cat.label}</span>
                <span style={{ fontSize: isMobile ? '0.6rem' : '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  {columnItems.length}
                </span>
              </div>

              {/* Column Cards Container */}
              <div style={{ padding: isMobile ? '4px' : '8px', display: 'flex', flexDirection: 'column', gap: isMobile ? '4px' : '8px', flex: 1, overflowY: 'auto' }}>
                {columnItems.length === 0 ? (
                  <div style={{ margin: 'auto', color: 'var(--text-muted)', fontSize: '0.6rem', textAlign: 'center', opacity: 0.4 }}>
                    Empty
                  </div>
                ) : (
                  columnItems.map((item) => {
                    const isMyCard = item.placerId === playerId;
                    const catColor = getCategoryColor(item.category);
                    
                    return (
                      <div
                        key={item.id}
                        className="surface-raised animate-fade-in"
                        style={{
                          padding: isMobile ? '6px' : '10px',
                          backgroundColor: 'var(--bg-surface)',
                          borderLeft: `2px solid ${item.isConflict ? 'var(--color-warning)' : catColor}`,
                          borderColor: item.isConflict ? 'var(--color-warning)' : catColor
                        }}
                        tabIndex={0}
                        role="region"
                        aria-label={`Card by ${item.placerName} in ${item.category} column`}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                          <span style={{ fontSize: isMobile ? '0.55rem' : '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                            {item.placerName}
                          </span>
                          
                          {isMyCard && (
                            <button
                              onClick={() => { if (window.confirm('Remove this card from the board?')) onRemoveCard(item.id); }}
                              style={{ background: 'transparent', padding: '2px', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                              className="hover-brighten"
                              aria-label={`Remove your card from ${item.category}`}
                            >
                              <Trash2 size={isMobile ? 8 : 10} />
                            </button>
                          )}
                        </div>

                        <p style={{ fontSize: isMobile ? '0.65rem' : '0.8rem', lineHeight: '1.3', marginBottom: '4px', color: '#ffffff' }}>
                          &ldquo;{item.text}&rdquo;
                        </p>

                        <div style={{ fontSize: isMobile ? '0.6rem' : '0.7rem', backgroundColor: 'rgba(0,0,0,0.15)', padding: '3px 5px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                          <strong style={{ color: 'var(--text-muted)' }}>Because: </strong>{item.because}
                        </div>

                        {item.isConflict && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '4px', color: 'var(--color-warning)', fontSize: '0.55rem', fontWeight: '600' }}>
                            <AlertTriangle size={8} />
                            <span>Contradicting Claims</span>
                          </div>
                        )}

                        {/* Challenge Section */}
                        <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                          {item.challengeStatus === 'pending' ? (
                            <div className="flex-col" style={{ gap: '3px' }}>
                              <span className="font-tech" style={{ fontSize: '0.55rem', color: 'var(--color-warning)', fontWeight: '700' }}>
                                CHALLENGE: {item.challengerName}
                              </span>
                              {isMeChallenged && (
                                <form onSubmit={(e) => handleChallengeSubmit(e, item.id)} style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                                  <input
                                    type="text"
                                    placeholder="Details..."
                                    value={challengeExplanation}
                                    onChange={(e) => setChallengeExplanation(e.target.value)}
                                    style={{ padding: '4px 6px', fontSize: isMobile ? '0.6rem' : '0.7rem', flex: 1 }}
                                    autoFocus
                                  />
                                  <button type="submit" className="btn-primary" style={{ padding: '4px 6px', fontSize: isMobile ? '0.6rem' : '0.7rem' }}>Send</button>
                                </form>
                              )}
                            </div>
                          ) : item.challengeStatus === 'resolved' ? (
                            <div style={{ fontSize: '0.55rem', color: 'var(--color-success)', backgroundColor: 'rgba(16, 185, 129, 0.02)', padding: '3px', borderRadius: '2px', borderLeft: '1px solid var(--color-success)' }}>
                              <strong>Details: </strong>{item.challengeText}
                            </div>
                          ) : item.challengeStatus === 'stalled' ? (
                            <div style={{ fontSize: '0.55rem', color: 'var(--color-danger)', backgroundColor: 'rgba(244, 63, 94, 0.02)', padding: '3px', borderRadius: '2px', borderLeft: '1px solid var(--color-danger)' }}>
                              <strong>Stalled: </strong>No details provided.
                            </div>
                          ) : (
                            !isMyCard && (
                              <button
                                onClick={() => onChallenge(item.id)}
                                className="btn-secondary"
                                style={{ width: '100%', padding: '2px 4px', fontSize: isMobile ? '0.55rem' : '0.65rem', borderRadius: '4px' }}
                                disabled={activeChallengeItem !== undefined}
                                aria-label={`Challenge card by ${item.placerName}`}
                              >
                                Challenge Card
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hand dock */}
      <div className="surface" style={{ padding: isMobile ? '10px' : '16px', backgroundColor: 'var(--bg-surface)' }}>
        <h4 style={{ fontSize: isMobile ? '0.6rem' : '0.7rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--text-secondary)' }}>
          SELECT RECOLLECTION TO BOARD PLACE
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '120px' : '210px'}, 1fr))`, gap: isMobile ? '4px' : '8px' }}>
          {privateHand.map((fact) => {
            const isPlaced = board.some(i => i.factId === fact.id && i.placerId === playerId);
            const color = getCategoryColor(fact.category);
            
            return (
              <div
                key={fact.id}
                onClick={() => !isPlaced && handleCardClick(fact)}
                className={`surface-raised ${!isPlaced ? 'hover-brighten' : ''}`}
                style={{
                  padding: isMobile ? '6px 8px' : '10px 12px',
                  cursor: isPlaced ? 'default' : 'pointer',
                  opacity: isPlaced ? 0.3 : 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  borderColor: isPlaced ? 'transparent' : 'rgba(255,255,255,0.03)'
                }}
                role="button"
                tabIndex={isPlaced ? -1 : 0}
                aria-label={isPlaced ? `${fact.category} fact already placed on board` : `Select ${fact.category} fact for board placement`}
                onKeyDown={(e) => { if (!isPlaced && (e.key === 'Enter' || e.key === ' ')) handleCardClick(fact); }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '3px' }}>
                  <span style={{ color: color }}>{catIcon(fact.category)}</span>
                  <span style={{ fontSize: isMobile ? '0.55rem' : '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    {fact.category}
                  </span>
                  {isPlaced && (
                    <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginLeft: 'auto', fontWeight: '700' }}>
                      BOARDED
                    </span>
                  )}
                </div>
                <p style={{ fontSize: isMobile ? '0.65rem' : '0.75rem', lineHeight: '1.3', color: 'var(--text-primary)' }}>
                  &ldquo;{fact.text}&rdquo;
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Place Fact Modal */}
      {selectedFact && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: isMobile ? '12px' : 0 }}>
          <div className="surface animate-scale-in" style={{ padding: isMobile ? '20px' : '28px', maxWidth: '440px', width: '100%', backgroundColor: 'var(--bg-floating)' }}>
            <h3 style={{ fontSize: isMobile ? '0.85rem' : '1rem', fontWeight: '700', marginBottom: '14px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Board Contribution
            </h3>

            <div className="surface-raised" style={{ padding: isMobile ? '10px' : '14px', backgroundColor: 'rgba(0, 0, 0, 0.15)', marginBottom: '16px', borderLeft: `3px solid ${getCategoryColor(selectedFact.category)}` }}>
              <span style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {selectedFact.category}
              </span>
              <p style={{ fontSize: isMobile ? '0.8rem' : '0.85rem', marginTop: '4px', lineHeight: '1.4' }}>
                &ldquo;{selectedFact.text}&rdquo;
              </p>
            </div>

            <form onSubmit={handlePlaceSubmit} className="flex-col" style={{ gap: isMobile ? '12px' : '16px' }}>
              <CustomDropdown
                options={categoryDropdownOptions}
                value={placementCategory}
                onChange={setPlacementCategory}
                label="Target Column"
              />

              <div>
                <span style={{ display: 'block', fontSize: isMobile ? '0.7rem' : '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Justification (Because)
                </span>
                <textarea
                  placeholder="e.g. Matches curatorial records..."
                  value={becauseText}
                  onChange={(e) => setBecauseText(e.target.value)}
                  required
                  rows={2}
                  style={{ resize: 'none', width: '100%', fontSize: isMobile ? '0.8rem' : '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedFact(null)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: isMobile ? '10px' : '12px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: isMobile ? '10px' : '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  Place Fact
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function catIcon(category) {
  switch (category.toLowerCase()) {
    case 'who': return <User size={12} />;
    case 'where': return <MapPin size={12} />;
    case 'when': return <Clock size={12} />;
    case 'how': return <Eye size={12} />;
    case 'why': return <Lightbulb size={12} />;
    default: return <Shield size={12} />;
  }
}

export default InvestigationBoard;
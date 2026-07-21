import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

function CustomDropdown({ options, value, onChange, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);
  
  const selectedOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev < options.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : options.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < options.length) {
          onChange(options[focusedIndex].value);
          setIsOpen(false);
        } else {
          // If no keyboard focus, toggle or select active
          setIsOpen(false);
        }
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        position: 'relative',
        width: '100%',
        outline: 'none'
      }}
    >
      {label && (
        <span
          style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '6px'
          }}
        >
          {label}
        </span>
      )}

      {/* Dropdown Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-glass-bright)',
          borderRadius: '6px',
          color: 'var(--text-primary)',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'var(--transition-smooth)',
          userSelect: 'none'
        }}
        className={isOpen ? 'focus-ring' : ''}
      >
        <span>{selectedOption ? selectedOption.label : 'Select...'}</span>
        <ChevronDown
          size={16}
          style={{
            color: 'var(--text-secondary)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>

      {/* Floating Panel Layer */}
      {isOpen && (
        <div
          className="animate-scale-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            width: '100%',
            zIndex: 1000,
            overflow: 'hidden',
            padding: '6px',
            background: 'rgba(14, 16, 22, 0.95)',
            border: '1px solid var(--border-glass-bright)',
            borderRadius: '6px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div
            style={{
              maxHeight: 'min(200px, 40vh)',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {options.map((opt, idx) => {
              const isSelected = opt.value === value;
              const isFocused = idx === focusedIndex;

              return (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  onMouseEnter={() => setFocusedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: isSelected ? '600' : '400',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    backgroundColor: isFocused
                      ? 'rgba(255, 255, 255, 0.05)'
                      : isSelected
                      ? 'rgba(124, 58, 237, 0.08)'
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.1s ease',
                    userSelect: 'none'
                  }}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <Check size={14} style={{ color: 'var(--accent-purple)' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <style>{`
        [tabindex="0"]:focus-visible > div {
          border-color: var(--accent-purple) !important;
          box-shadow: 0 0 0 1px var(--accent-purple) !important;
        }
      `}</style>
    </div>
  );
}

export default CustomDropdown;

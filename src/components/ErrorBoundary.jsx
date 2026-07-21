import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100vh', padding: '24px', textAlign: 'center', color: 'var(--text-secondary)',
          background: 'var(--bg-app)'
        }}>
          <h2 style={{ color: 'var(--color-danger)', marginBottom: '12px', fontSize: '1.2rem' }}>Something went wrong</h2>
          <p style={{ fontSize: '0.85rem', marginBottom: '24px' }}>{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button
            className="btn-primary"
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

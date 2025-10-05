import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 Error capturado por ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-base-200">
          <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-error">Error en la aplicación</h2>
              <p className="text-sm">{this.state.error?.toString()}</p>
              <p className="text-xs text-base-content/60 mt-2">
                {this.state.errorInfo?.componentStack}
              </p>
              <div className="card-actions justify-end mt-4">
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => window.location.reload()}
                >
                  Recargar
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

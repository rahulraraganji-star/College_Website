import React from "react";

class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ADMIN ERROR CAUGHT BY BOUNDARY:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-[800px] mx-auto p-6 my-8 rounded-xl border border-red-200 bg-red-50 text-red-700">
          <h2 className="text-base font-semibold mb-1">An error occurred in this view</h2>
          <p className="text-xs text-red-600 mb-4 font-mono">
            {this.state.error?.message || "Unexpected UI error"}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AdminErrorBoundary;

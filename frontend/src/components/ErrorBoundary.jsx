import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-red-900/20 border border-red-500 rounded-xl text-red-200 font-mono overflow-auto max-h-screen">
                    <h2 className="text-xl font-bold mb-4">Something went wrong.</h2>
                    <details className="whitespace-pre-wrap">
                        <summary>Error Details</summary>
                        <p className="mt-2 text-red-400">{this.state.error && this.state.error.toString()}</p>
                        <p className="mt-2 text-xs text-gray-400">{this.state.errorInfo && this.state.errorInfo.componentStack}</p>
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

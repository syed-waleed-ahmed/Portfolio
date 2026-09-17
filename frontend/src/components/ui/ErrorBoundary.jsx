import { Component } from "react";

// Wraps each section on its own, so a render error takes down that section
// rather than the page. The fallback offers a reload: re-rendering the same
// tree would just throw the same error again.
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="container error-fallback" role="alert">
        <p>This section could not be displayed.</p>
        <button type="button" className="btn btn--secondary btn--sm" onClick={() => window.location.reload()}>
          Reload page
        </button>
      </div>
    );
  }
}

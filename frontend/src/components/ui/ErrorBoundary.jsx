import { Component } from "react";

// Wraps each section on its own, so a render error takes down that section
// rather than the page. The default fallback offers a reload: re-rendering the
// same tree would just throw the same error again.
//
// An optional piece of a section can pass its own `fallback` instead.
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
    if (this.props.fallback) return this.props.fallback;

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

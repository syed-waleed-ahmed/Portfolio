import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  // An optional piece of a page can supply its own fallback.
  fallback?: ReactNode;
}

// Wraps each section, so a render error takes that section down rather than
// the page. Re-rendering would throw again, so the fallback offers a reload.
export default class ErrorBoundary extends Component<Props, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  override render() {
    if (!this.state.failed) return this.props.children;
    if (this.props.fallback) return this.props.fallback;
    return (
      <div className="container error-fallback" role="alert">
        <p>This part of the page could not be displayed.</p>
        <button type="button" className="button button--quiet button--compact" onClick={() => window.location.reload()}>
          Reload page
        </button>
      </div>
    );
  }
}

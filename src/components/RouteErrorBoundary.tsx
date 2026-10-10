import React from "react";

interface Props {
  children: React.ReactNode;
  /** Changes on every navigation; when it changes the boundary clears its error so the new page renders. */
  resetKey?: string;
}

interface State {
  error: Error | null;
}

/**
 * Contains render errors so one broken component can never blank the whole app.
 * Without this, React unmounts everything on an uncaught error and links stop working until a refresh.
 */
export class RouteErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Page error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-[50vh] w-full flex items-center justify-center px-4 py-16 bg-surface">
          <div className="text-center max-w-sm">
            <h1 className="text-xl font-extrabold text-navy">This page couldn't load</h1>
            <p className="mt-2 text-sm text-muted">Something went wrong. Try again, or go back to the home page.</p>
            <div className="mt-5 flex justify-center gap-2">
              <button onClick={() => this.setState({ error: null })} className="h-11 px-5 rounded-xl bg-navy text-white font-semibold">Try again</button>
              <a href="/" className="h-11 px-5 inline-flex items-center rounded-xl border border-line bg-white font-semibold text-navy">Home</a>
            </div>
          </div>
        </div>);

    }
    return this.props.children;
  }
}
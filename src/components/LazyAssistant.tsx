import { Component, lazy, Suspense, type ReactNode } from "react";

/** Retries once after a short wait (e.g. a file replaced by a new deploy), then gives up quietly. */
const Inner = lazy(() =>
  import("./Assistant")
    .catch(() => new Promise((r) => setTimeout(r, 1500)).then(() => import("./Assistant")))
    .then((m) => ({ default: m.Assistant })),
);

class Quiet extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Loads the heavy chat bundle only after the page is shown; a load failure never blanks the page. */
export function Assistant() {
  return (
    <Quiet>
      <Suspense fallback={null}>
        <Inner />
      </Suspense>
    </Quiet>
  );
}

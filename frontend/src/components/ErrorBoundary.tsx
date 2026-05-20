import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

// Ch13-error-handling
// 想定外の例外を捕まえてフォールバック UI を出す。
// 本番では Sentry など外部にロギングするが、教材では console.error + 再読み込みボタンに留める。
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(err: Error, info: { componentStack?: string }) {
    console.error("[ErrorBoundary]", err, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface-second px-4">
          <div className="max-w-md rounded-2xl border border-line bg-white p-6 text-center shadow-sm">
            <h1 className="text-base font-bold text-ink">画面表示中に問題が発生しました</h1>
            <p className="mt-2 text-sm text-ink-sub">
              {this.state.message ?? "予期しないエラーが発生しました。"}
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-4 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-hover"
            >
              再読み込み
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

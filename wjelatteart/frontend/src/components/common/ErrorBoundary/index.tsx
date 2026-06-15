import { Component, ErrorInfo, ReactNode } from "react";
import styles from "./styles.module.css";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Application error boundary captured an error.", error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className={styles.shell}>
          <section className={styles.panel}>
            <p className={styles.kicker}>应用异常</p>
            <h1>画布暂时无法打开</h1>
            <p>请刷新页面重试；已经保存的作品仍保留在本地。</p>
            <button type="button" onClick={() => window.location.reload()}>
              刷新页面
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}


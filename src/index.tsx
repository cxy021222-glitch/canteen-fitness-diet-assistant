import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import App from "./app";
import "./index.css";

function Fallback({ error, resetErrorBoundary }: { error: unknown; resetErrorBoundary: () => void }) {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper p-12 text-center font-serif text-ink">
      <h1 className="mb-2 text-2xl font-semibold">这一页还没能翻开</h1>
      <p className="mb-6 max-w-md text-muted-foreground text-sm">
        {message || "发生了一个意外。可以回到工作台继续，或者刷新页面。"}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="rounded-sm border border-border bg-paper px-5 py-2 hover:bg-card"
      >
        回到工作台
      </button>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary fallbackRender={Fallback}>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
);

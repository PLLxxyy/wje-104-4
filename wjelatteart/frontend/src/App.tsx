import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { AppRouter } from "./router";

export const App = (): JSX.Element => (
  <ErrorBoundary>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </ErrorBoundary>
);


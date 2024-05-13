import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import AuthPage from "./components/AuthPage.jsx";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthPage />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default App;

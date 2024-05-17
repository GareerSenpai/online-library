import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import AuthPage from "./components/AuthPage.jsx";
import SearchBox from "./components/SearchBox.jsx";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* <AuthPage /> */}
      <SearchBox />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default App;

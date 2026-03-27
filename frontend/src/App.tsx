import { useEffect, useState } from "react";
import { getAccessToken } from "./services/auth";
import LoginPage from "./components/LoginPage";
import TripForm from "./components/TripForm";
import "./App.css";

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clean up URL params after Spotify redirect
    const params = new URLSearchParams(window.location.search);
    if (params.has("logged_in") || params.has("error")) {
      window.history.replaceState({}, "", "/");
    }

    getAccessToken().then((t) => {
      setToken(t);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="loading">Loading…</div>;
  }

  return token ? <TripForm token={token} /> : <LoginPage />;
}

export default App;

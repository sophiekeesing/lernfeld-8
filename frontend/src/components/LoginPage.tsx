import { loginUrl } from "../services/auth";
import "./LoginPage.css";

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-card">
        <h1>🚆🎵 Trainify</h1>
        <p>
          Generate a Spotify playlist that perfectly matches your train journey.
        </p>
        <a href={loginUrl()} className="login-btn">
          Login with Spotify
        </a>
      </div>
    </div>
  );
}

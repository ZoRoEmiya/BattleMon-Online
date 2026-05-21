import { useState } from "react";
import { loginUser } from "../api/authApi";

function LoginPage({ onLogin, onNavigate }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const data = await loginUser({ username, password });
      onLogin(data);
      onNavigate("team-builder");
    } catch (err) {
      setError(err.response?.data?.error || "Could not log in");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="page auth-page">
      <h1>Login</h1>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error && <p className="error-message">{error}</p>}

        <button disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;

import { useState } from "react";
import { registerUser } from "../api/authApi";

function RegisterPage({ onLogin, onNavigate }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const data = await registerUser({ username, password });
      onLogin(data);
      onNavigate("team-builder");
    } catch (err) {
      setError(err.response?.data?.error || "Could not register");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="page auth-page">
      <h1>Register</h1>

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
          {isLoading ? "Creating account..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;

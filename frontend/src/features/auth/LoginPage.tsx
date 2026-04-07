import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_CREDENTIALS } from "./mockCredentials";
import { useAuth } from "./useAuth";
import "./LoginPage.css";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const ok =
      email.trim() === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password;
    if (!ok) {
      setError("Email or password does not match the demo account.");
      return;
    }
    login();
    navigate("/", { replace: true });
  }

  return (
    <div className="login-page">
      <div className="login-page__container">
        <div className="login-page__card">
          <div className="login-page__brand">
            <span className="login-page__logo" aria-hidden />
            <div>
              <h1 className="login-page__title">Sign in</h1>
              <p className="login-page__subtitle">Use your demo account to open the dashboard.</p>
            </div>
          </div>

          <aside className="login-page__demo" aria-label="Demo credentials">
            <p className="login-page__demo-label">Demo login</p>
            <dl className="login-page__demo-list">
              <div>
                <dt>Email</dt>
                <dd>
                  <code>{MOCK_CREDENTIALS.email}</code>
                </dd>
              </div>
              <div>
                <dt>Password</dt>
                <dd>
                  <code>{MOCK_CREDENTIALS.password}</code>
                </dd>
              </div>
            </dl>
          </aside>

          <form className="login-page__form" onSubmit={handleSubmit} noValidate>
            <label className="login-page__field">
              <span className="login-page__label">Email</span>
              <input
                className="login-page__input"
                type="email"
                name="email"
                autoComplete="username"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>
            <label className="login-page__field">
              <span className="login-page__label">Password</span>
              <input
                className="login-page__input"
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                placeholder="••••••••"
                required
              />
            </label>
            {error && (
              <p className="login-page__error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="login-page__submit">
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

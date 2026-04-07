import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../../api/authApi";
import { DEMO_ACCOUNTS } from "./demoAccounts";
import { useAuth } from "./useAuth";
import "./LoginPage.css";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data = await loginRequest(email.trim(), password);
      login(data.accessToken, data.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__container">
        <div className="login-page__card">
          <div className="login-page__brand">
            <span className="login-page__logo" aria-hidden />
            <div>
              <h1 className="login-page__title">Sign in</h1>
              <p className="login-page__subtitle">Use a demo account below or your own credentials.</p>
            </div>
          </div>

          <aside className="login-page__demo" aria-label="Demo credentials">
            <p className="login-page__demo-label">Demo accounts</p>
            <ul className="login-page__demo-list">
              {DEMO_ACCOUNTS.map((acc) => (
                <li key={acc.email} className="login-page__demo-item">
                  <span className="login-page__demo-name">{acc.label}</span>
                  <div className="login-page__demo-row">
                    <span className="login-page__demo-k">Email</span>
                    <code>{acc.email}</code>
                  </div>
                  <div className="login-page__demo-row">
                    <span className="login-page__demo-k">Password</span>
                    <code>{acc.password}</code>
                  </div>
                </li>
              ))}
            </ul>
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
                disabled={submitting}
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
                disabled={submitting}
                required
              />
            </label>
            {error && (
              <p className="login-page__error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="login-page__submit" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("Email sau parolă incorecte. Verifică datele introduse.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Prea multe încercări nereușite. Te rugăm să aștepți câteva minute sau să resetezi parola.");
      } else {
        setError(err.message || "A apărut o eroare la autentificare.");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Te rugăm să introduci adresa de email.");
      return;
    }
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      await resetPassword(email.trim());
      setSuccess(`Am trimis linkul de resetare pe adresa ${email.trim()}. Verifică inbox-ul și folderul Spam.`);
    } catch (err) {
      console.error("Reset password error:", err);
      if (err.code === "auth/user-not-found") {
        setError("Nu există niciun cont asociat acestei adrese de email.");
      } else {
        setError("Nu am putut trimite emailul de resetare. Verifică adresa de email.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-glow login-glow-one" aria-hidden="true" />
      <div className="login-glow login-glow-two" aria-hidden="true" />

      <main className="login-shell">
        <section className="login-story" aria-label="Laborator Emanuela">
          <div className="login-wordmark light">
            <span className="login-mark">E</span>
            <span>
              <strong>Laborator Emanuela</strong>
              <small>Lingurițe de bunătate</small>
            </span>
          </div>

          <div className="login-story-copy">
            <p className="login-kicker">Spațiul echipei</p>
            <h1>Tot laboratorul,<br />într-un singur loc.</h1>
            <p>
              Gestionează produsele, comenzile, rezervările și locațiile dintr-un
              panou construit pentru ritmul echipei Emanuela.
            </p>
          </div>

          <div className="login-capabilities" aria-label="Funcționalități">
            <span>Catalog</span>
            <span>Comenzi</span>
            <span>Locații</span>
            <span>Rezervări 2D</span>
            <span>Notificări Push</span>
          </div>
        </section>

        <section className="login-access">
          {!isForgot ? (
            <form className="login-card" onSubmit={handleLogin}>
              <div className="login-wordmark compact">
                <span className="login-mark">E</span>
                <span>
                  <strong>Laborator Emanuela</strong>
                  <small>Administrare</small>
                </span>
              </div>

              <div className="login-heading">
                <p className="login-kicker">Acces securizat</p>
                <h2>Bine ai revenit</h2>
                <p>Autentifică-te pentru a continua în panoul de administrare.</p>
              </div>

              <label>
                <span>Adresă de email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nume@laboratoremanuela.ro"
                  autoComplete="email"
                  required
                  autoFocus
                />
              </label>

              <label>
                <span>Parolă</span>
                <div className="login-password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Introdu parola"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="login-toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ascunde parola" : "Arată parola"}
                    title={showPassword ? "Ascunde parola" : "Arată parola"}
                    tabIndex="-1"
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>

              <div className="login-forgot-wrapper">
                <button
                  type="button"
                  className="login-forgot-btn"
                  onClick={() => {
                    setIsForgot(true);
                    setError(null);
                    setSuccess(null);
                  }}
                >
                  Ai uitat parola?
                </button>
              </div>

              {error && <div className="login-error" role="alert">{error}</div>}
              {success && <div className="login-success" role="status">{success}</div>}

              <button className="btn btn-primary btn-block login-submit" type="submit" disabled={busy}>
                <span>{busy ? "Se autentifică…" : "Intră în panou"}</span>
                {!busy && <span aria-hidden="true">→</span>}
              </button>

              <p className="login-security">Acces disponibil exclusiv echipei autorizate.</p>
            </form>
          ) : (
            <form className="login-card" onSubmit={handleResetPassword}>
              <div className="login-wordmark compact">
                <span className="login-mark">E</span>
                <span>
                  <strong>Laborator Emanuela</strong>
                  <small>Administrare</small>
                </span>
              </div>

              <div className="login-heading">
                <p className="login-kicker">Recuperare cont</p>
                <h2>Resetare parolă</h2>
                <p>Introdu adresa de email pentru a primi instrucțiunile de resetare.</p>
              </div>

              <label>
                <span>Adresă de email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nume@laboratoremanuela.ro"
                  autoComplete="email"
                  required
                  autoFocus
                />
              </label>

              {error && <div className="login-error" role="alert">{error}</div>}
              {success && <div className="login-success" role="status">{success}</div>}

              <button className="btn btn-primary btn-block login-submit" type="submit" disabled={busy}>
                <span>{busy ? "Se trimite…" : "Trimite link de resetare"}</span>
                {!busy && <span aria-hidden="true">✉</span>}
              </button>

              <button
                type="button"
                className="login-back-btn"
                onClick={() => {
                  setIsForgot(false);
                  setError(null);
                  setSuccess(null);
                }}
              >
                ← Înapoi la autentificare
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

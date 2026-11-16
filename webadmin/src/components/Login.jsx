import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      console.error(err);
      setError("Email sau parolă incorecte.");
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
          </div>
        </section>

        <section className="login-access">
          <form className="login-card" onSubmit={submit}>
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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introdu parola"
                autoComplete="current-password"
                required
              />
            </label>

            {error && <div className="login-error" role="alert">{error}</div>}

            <button className="btn btn-primary btn-block login-submit" type="submit" disabled={busy}>
              <span>{busy ? "Se autentifică…" : "Intră în panou"}</span>
              {!busy && <span aria-hidden="true">→</span>}
            </button>

            <p className="login-security">Acces disponibil exclusiv echipei autorizate.</p>
          </form>
        </section>
      </main>
    </div>
  );
}

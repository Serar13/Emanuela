export default function SettingsCard({ title, description, children, onSubmit, busy, saved }) {
  return (
    <form className="settings-card" onSubmit={onSubmit}>
      <header className="settings-card-head">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        <div className="settings-actions">
          {saved && <span className="save-confirmation">Salvat</span>}
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? "Se salvează…" : "Salvează modificările"}
          </button>
        </div>
      </header>
      <div className="settings-grid">{children}</div>
    </form>
  );
}

export function SettingField({ label, help, wide, children }) {
  return (
    <label className={`setting-field ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      {children}
      {help && <small>{help}</small>}
    </label>
  );
}

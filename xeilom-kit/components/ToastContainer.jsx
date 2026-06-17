export function ToastContainer({ toasts, removeToast }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type}`}
          role={t.type === "error" ? "alert" : "status"}
        >
          <button
            type="button"
            className="toast-close"
            onClick={() => removeToast(t.id)}
            aria-label="Fermer"
          >
            ×
          </button>
          <strong>{t.title}</strong>
          {t.message && <p>{t.message}</p>}
        </div>
      ))}
    </div>
  );
}

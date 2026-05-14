export function FormTextarea({
  label,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-vault-text">{label}</span>
      <textarea
        aria-invalid={Boolean(error)}
        className="min-h-32 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-text outline-none transition placeholder:text-vault-muted focus:border-vault-gold focus:ring-2 focus:ring-vault-gold/20"
        {...props}
      />
      {error ? <span className="text-xs text-vault-error">{error}</span> : null}
    </label>
  );
}

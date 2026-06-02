export function FormSelect({
  label,
  options,
  error,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: string[]; error?: string }) {
  return (
    <label className="grid min-w-0 gap-2">
      <span className="text-sm font-semibold text-vault-text">{label}</span>
      <select
        aria-invalid={Boolean(error)}
        className="min-h-12 w-full min-w-0 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-text outline-none transition focus:border-vault-gold focus:ring-2 focus:ring-vault-gold/20"
        {...props}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-vault-error">{error}</span> : null}
    </label>
  );
}

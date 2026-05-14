export function ProductMetaRow({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === "") {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 border-b border-vault-border py-3 text-sm">
      <dt className="text-vault-muted">{label}</dt>
      <dd className="text-right font-semibold text-vault-text">{value}</dd>
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? <p className="mb-3 text-sm font-semibold uppercase text-vault-gold">{eyebrow}</p> : null}
      <h2 className="text-3xl font-black text-vault-text sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-vault-secondaryText">{description}</p> : null}
    </div>
  );
}

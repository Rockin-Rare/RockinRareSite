"use client";

export function FileUploadPlaceholder({
  files,
  onFilesSelected
}: {
  files: File[];
  onFilesSelected: (files: File[]) => void;
}) {
  return (
    <label className="grid cursor-pointer gap-3 rounded-2xl border border-dashed border-vault-border bg-vault-secondary p-5 text-center transition hover:border-vault-gold">
      <span className="text-sm font-semibold text-vault-text">Upload photos placeholder</span>
      <span className="text-sm text-vault-secondaryText">
        Choose front, back, sealed product, or collection overview photos. File names are included in the Discord submission for now.
      </span>
      <input
        className="sr-only"
        multiple
        onChange={(event) => onFilesSelected(Array.from(event.target.files ?? []))}
        type="file"
      />
      {files.length > 0 ? (
        <span className="text-xs text-vault-gold">{files.map((file) => file.name).join(", ")}</span>
      ) : null}
      {/* TODO: Upload selected files to Supabase Storage bucket submission-images before creating submission rows. */}
    </label>
  );
}

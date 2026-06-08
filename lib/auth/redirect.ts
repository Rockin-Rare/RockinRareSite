export const defaultAuthRedirectPath = "/wishlist";

export function authRedirectPath(value: FormDataEntryValue | string | null | undefined) {
  const path = typeof value === "string" ? value.trim().slice(0, 200) : "";

  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/auth/")) {
    return defaultAuthRedirectPath;
  }

  return path;
}

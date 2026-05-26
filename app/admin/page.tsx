import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  adminSessionCookieName,
  adminSessionCookieOptions,
  adminTokenMatches,
  createAdminSessionValue,
  hasAdminSession,
  listingAdminConfigured
} from "@/lib/admin-session";

type PageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: PageProps) {
  if (await hasAdminSession()) {
    redirect("/admin/listings");
  }

  const error = (await searchParams)?.error;

  async function login(formData: FormData) {
    "use server";

    const token = String(formData.get("token") ?? "");
    const sessionValue = adminTokenMatches(token) ? createAdminSessionValue() : null;

    if (!sessionValue) {
      redirect("/admin?error=1");
    }

    const cookieStore = await cookies();
    cookieStore.set(adminSessionCookieName, sessionValue, adminSessionCookieOptions());
    redirect("/admin/listings");
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-vault-border bg-vault-card p-6">
        <h1 className="text-2xl font-black text-vault-text">Listing Admin</h1>
        <p className="mt-3 text-sm leading-6 text-vault-secondaryText">
          Sign in to open storefront listings and jump to their source records in Card Intake Router.
        </p>

        {!listingAdminConfigured() ? (
          <div className="mt-5 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-secondaryText">
            Set <code>ROCKIN_RARE_ADMIN_TOKEN</code> before using the admin listing handoff.
          </div>
        ) : null}

        <form action={login} className="mt-6 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-vault-text">Admin token</span>
            <input
              className="min-h-12 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-text outline-none transition focus:border-vault-gold focus:ring-2 focus:ring-vault-gold/20"
              name="token"
              type="password"
              required
            />
          </label>
          {error ? <p className="text-sm font-semibold text-vault-error">That token did not match.</p> : null}
          <Button disabled={!listingAdminConfigured()} type="submit">
            Continue
          </Button>
        </form>
      </div>
    </main>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { Container } from "@/components/layout/Container";
import { signUpAction } from "@/app/auth/actions";
import { authRedirectPath } from "@/lib/auth/redirect";
import { getCurrentAuthUser } from "@/lib/auth/current";

type PageProps = {
  searchParams?: Promise<{ redirectTo?: string }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a Rockin Rare account to save and edit your Rare Radar wishlist.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function SignUpPage({ searchParams }: PageProps) {
  const redirectTo = authRedirectPath((await searchParams)?.redirectTo);
  const isCollectorClub = redirectTo.startsWith("/collector-club");
  const user = await getCurrentAuthUser();

  if (user) {
    redirect(redirectTo);
  }

  return (
    <Container className="grid min-h-[70vh] place-items-center py-14">
      <div className="w-full max-w-md">
        <p className="mb-3 text-sm font-semibold uppercase text-vault-gold">{isCollectorClub ? "Collector Club" : "Rare Radar"}</p>
        <h1 className="text-4xl font-black text-vault-text">Create an account</h1>
        <p className="mt-3 text-sm leading-6 text-vault-secondaryText">
          {isCollectorClub
            ? "Create your free Collector Club account for collecting preferences, drop alerts, and Rare Radar."
            : "Save the cards, slabs, sealed product, and sets you want Rockin Rare to watch for."}
        </p>
        <div className="mt-6">
          <AuthForm action={signUpAction} buttonLabel={isCollectorClub ? "Create Collector Club Account" : "Create Account"} mode="sign-up" redirectTo={redirectTo} />
        </div>
        <p className="mt-5 text-sm text-vault-secondaryText">
          Already have an account?{" "}
          <Link className="font-semibold text-vault-highlight hover:text-vault-gold" href={`/auth/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`}>
            Sign in
          </Link>
        </p>
      </div>
    </Container>
  );
}

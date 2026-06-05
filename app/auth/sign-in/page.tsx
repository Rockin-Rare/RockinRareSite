import Link from "next/link";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { Container } from "@/components/layout/Container";
import { signInAction } from "@/app/auth/actions";

type PageProps = {
  searchParams?: Promise<{ redirectTo?: string }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Rockin Rare account to manage your Rare Radar wishlist.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function SignInPage({ searchParams }: PageProps) {
  const redirectTo = (await searchParams)?.redirectTo || "/wishlist";
  const isCollectorClub = redirectTo.startsWith("/collector-club");

  return (
    <Container className="grid min-h-[70vh] place-items-center py-14">
      <div className="w-full max-w-md">
        <p className="mb-3 text-sm font-semibold uppercase text-vault-gold">{isCollectorClub ? "Collector Club" : "Rare Radar"}</p>
        <h1 className="text-4xl font-black text-vault-text">Sign in</h1>
        <p className="mt-3 text-sm leading-6 text-vault-secondaryText">
          {isCollectorClub
            ? "Access your Collector Club profile, collecting preferences, and Rare Radar chase list."
            : "Access your Rare Radar chase list, edit chase cards, and keep your alerts current."}
        </p>
        <div className="mt-6">
          <AuthForm action={signInAction} buttonLabel="Sign In" mode="sign-in" redirectTo={redirectTo} />
        </div>
        <p className="mt-5 text-sm text-vault-secondaryText">
          Need an account?{" "}
          <Link className="font-semibold text-vault-highlight hover:text-vault-gold" href={`/auth/sign-up?redirectTo=${encodeURIComponent(redirectTo)}`}>
            Create one
          </Link>
        </p>
      </div>
    </Container>
  );
}

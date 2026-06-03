"use client";

import { useActionState } from "react";
import type { AuthActionState } from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";

type AuthFormProps = {
  action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;
  buttonLabel: string;
  mode: "sign-in" | "sign-up";
  redirectTo?: string;
};

const initialState: AuthActionState = { error: "" };

export function AuthForm({ action, buttonLabel, mode, redirectTo = "/wishlist" }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-4 rounded-2xl border border-vault-border bg-vault-card p-5 shadow-vault">
      <input name="redirectTo" type="hidden" value={redirectTo} />
      {mode === "sign-up" ? (
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-vault-text">Name</span>
          <input
            className="min-h-12 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-text outline-none transition focus:border-vault-gold focus:ring-2 focus:ring-vault-gold/20"
            maxLength={120}
            name="name"
            required
            type="text"
          />
        </label>
      ) : null}
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-vault-text">Email</span>
        <input
          className="min-h-12 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-text outline-none transition focus:border-vault-gold focus:ring-2 focus:ring-vault-gold/20"
          maxLength={254}
          name="email"
          required
          type="email"
        />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-vault-text">Password</span>
        <input
          className="min-h-12 rounded-xl border border-vault-border bg-vault-secondary px-4 py-3 text-sm text-vault-text outline-none transition focus:border-vault-gold focus:ring-2 focus:ring-vault-gold/20"
          maxLength={200}
          minLength={8}
          name="password"
          required
          type="password"
        />
      </label>
      {state.error ? (
        <p className="rounded-xl border border-vault-error/30 bg-vault-error/10 px-4 py-3 text-sm text-vault-error" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button disabled={isPending} type="submit">
        {isPending ? "Working..." : buttonLabel}
      </Button>
    </form>
  );
}

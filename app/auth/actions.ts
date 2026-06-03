"use server";

import { redirect } from "next/navigation";
import { auth, hasNeonAuth } from "@/lib/auth/server";

export type AuthActionState = {
  error: string;
};

const initialRedirectPath = "/wishlist";

function cleanString(value: FormDataEntryValue | null, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function redirectPath(value: FormDataEntryValue | null) {
  const path = cleanString(value, 200);
  return path.startsWith("/") && !path.startsWith("//") ? path : initialRedirectPath;
}

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return fallback;
}

export async function signInAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  if (!hasNeonAuth()) {
    return { error: "Neon Auth is not configured yet." };
  }

  const email = cleanString(formData.get("email"), 254);
  const password = cleanString(formData.get("password"), 200);

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const result = await auth.signIn.email({ email, password });
  if (result.error) {
    return { error: errorMessage(result.error, "Unable to sign in.") };
  }

  redirect(redirectPath(formData.get("redirectTo")));
}

export async function signUpAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  if (!hasNeonAuth()) {
    return { error: "Neon Auth is not configured yet." };
  }

  const name = cleanString(formData.get("name"), 120);
  const email = cleanString(formData.get("email"), 254);
  const password = cleanString(formData.get("password"), 200);

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required." };
  }

  if (password.length < 8) {
    return { error: "Use at least 8 characters for your password." };
  }

  const result = await auth.signUp.email({ email, password, name });
  if (result.error) {
    return { error: errorMessage(result.error, "Unable to create account.") };
  }

  redirect(redirectPath(formData.get("redirectTo")));
}

export async function signOutAction() {
  if (hasNeonAuth()) {
    await auth.signOut();
  }

  redirect("/");
}

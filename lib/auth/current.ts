import { auth, hasNeonAuth } from "@/lib/auth/server";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export async function getCurrentAuthUser(): Promise<AuthUser | null> {
  if (!hasNeonAuth()) return null;

  const { data: session } = await auth.getSession();
  const user = session?.user;
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name
  };
}

import { AuthUser } from "./store";
import { LoginFormValues } from "./schema";

export interface LoginResponse {
  user: AuthUser;
}

// Endpoint not implemented yet in apps/api; base URL is env-driven so it can be wired up later.
export async function login(
  credentials: LoginFormValues,
): Promise<LoginResponse> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Invalid email or password.");
  }

  return response.json();
}

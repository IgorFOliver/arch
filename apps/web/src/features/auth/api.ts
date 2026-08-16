import { AuthUser } from "./store";
import { LoginFormValues } from "./schema";

export interface SessionResponse {
  user: AuthUser;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function auth0LoginUrl(): string {
  return `${API_URL}/auth/auth0/login`;
}

export async function login(
  credentials: LoginFormValues,
): Promise<SessionResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Invalid email or password.");
  }

  return response.json();
}

export async function getSession(): Promise<SessionResponse | null> {
  const response = await fetch(`${API_URL}/auth/session`, {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to load the current session.");
  }

  return response.json();
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:3001";

export function loginUrl(): string {
  return `${BACKEND_URL}/auth/login`;
}

export async function getAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/token`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.access_token ?? null;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await fetch(`${BACKEND_URL}/auth/logout`, { method: "POST" });
}

import { createCookieSessionStorage, redirect } from "@remix-run/node";

const sessionSecret = process.env.SESSION_SECRET || "default-secret-key";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getAuthSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function requireAuthSession(request: Request) {
  const session = await getAuthSession(request);
  if (!session.has("userId")) {
    throw redirect("/auth/login");
  }
  return session;
}

export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request;
  userId: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getAuthSession(request);
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getAuthSession(request);
  return redirect("/auth/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
} 
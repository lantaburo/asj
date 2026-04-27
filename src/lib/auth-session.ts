import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import { env } from "@/lib/env";

export const AUTH_SESSION_COOKIE_NAME = "ajs_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

type SessionPayload = {
  userId: string;
  exp: number;
};

function signSessionValue(value: string) {
  return createHmac("sha256", env.AUTH_SESSION_SECRET).update(value).digest("base64url");
}

function encodePayload(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodePayload(value: string) {
  try {
    const payload = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as
      | SessionPayload
      | null;

    if (!payload || typeof payload.userId !== "string" || typeof payload.exp !== "number") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function createSessionToken(userId: string) {
  const payload = encodePayload({
    userId,
    exp: Date.now() + SESSION_DURATION_SECONDS * 1000
  });
  const signature = signSessionValue(payload);

  return `${payload}.${signature}`;
}

export function verifySessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signSessionValue(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  const decodedPayload = decodePayload(payload);

  if (!decodedPayload || decodedPayload.exp < Date.now()) {
    return null;
  }

  return decodedPayload;
}

export function setAuthSessionCookie(response: NextResponse, userId: string) {
  response.cookies.set({
    name: AUTH_SESSION_COOKIE_NAME,
    value: createSessionToken(userId),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS
  });
}

export function clearAuthSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export async function getCurrentSessionPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_SESSION_COOKIE_NAME)?.value;

  return verifySessionToken(token);
}

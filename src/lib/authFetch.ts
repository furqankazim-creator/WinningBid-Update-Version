"use client";
import { getSession } from "./api";

/** fetch() that adds the signed-in user's token, for the app's own /api routes. */
export function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = getSession()?.token;
  const headers = new Headers(init.headers);
  if (token && !headers.has("authorization")) headers.set("authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}

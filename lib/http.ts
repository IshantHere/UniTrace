import { NextResponse } from "next/server";
export function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 400;
  return NextResponse.json({ error: message === "UNAUTHORIZED" ? "Please sign in" : message === "FORBIDDEN" ? "You do not have permission" : message }, { status });
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { NextResponse } from "next/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function CreateResponseApiSuccess<T>(data: T, status?: number) {
  return NextResponse.json(
    {
      data,
      status: status || 200,
      isError: false
    },
    { status: status || 200 }
  );
}

export function CreateResponseApiError(error: Error, status?: number) {
  const isDev = process.env.NODE_ENV === "development";
  return NextResponse.json(
    {
      error: {
        message: error.message,
        stack: isDev ? error.stack : undefined,
        name: error.name
      },
      status: status || 500,
      isError: true
    },
    {
      status: status || 500
    }
  );
}

export function truncateString(str: string, maxLength: number) {
  return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
}

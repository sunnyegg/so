import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { NextResponse } from "next/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// logger
export const log = (level: string, fnName: string, data: any) => {
  const timestamp = new Date().toISOString();

  const structuredData = {
    level,
    fnName,
    data,
    timestamp
  };
  const stringifiedData = JSON.stringify(structuredData, null, 2);

  switch (level) {
    case "error":
      console.error(stringifiedData);
      break;

    default:
      console.log(stringifiedData);
      break;
  }
};

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

export function CreateResponseApiError(
  error: Error,
  fnName: string,
  status?: number
) {
  const isDev = process.env.NODE_ENV === "development";
  log("error", fnName, error);
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

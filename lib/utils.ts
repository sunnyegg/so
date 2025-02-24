import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
    timestamp,
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

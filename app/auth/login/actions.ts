"use server";

import { Auth } from "@/types/auth";

export type LoginResponse = {
  status: boolean;
  data: Auth;
};

export async function loginAction(code: string, scope: string) {
  try {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/login?code=${code}&scope=${scope}`;
    const res = await fetch(url, {
      method: "GET"
    });

    if (!res.ok) {
      return {
        success: false,
        message: "Failed to login",
        data: null
      };
    }

    const data = (await res.json()) as LoginResponse;
    if (!data.status) {
      return {
        success: false,
        message: "Failed to login",
        data: null
      };
    }

    return {
      success: true,
      message: "Login successful",
      data: data.data
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "An error occurred during login",
      data: null
    };
  }
}

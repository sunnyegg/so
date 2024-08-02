"use client";

import { useContext, useState } from "react";

import { ErrorContext, IErrorContext } from "@/context/error";
import { ISuccessContext, SuccessContext } from "@/context/success";

import useLogin from "@/hooks/auth/useLogin";

import Button from "@/components/common/button";
import TopBar from "@/components/common/topbar";
import ToastErrorSuccess from "@/components/common/toastErrorSuccess";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const { errors, setErrors } = useContext(ErrorContext) as IErrorContext;
  const { successes, setSuccesses } = useContext(SuccessContext) as ISuccessContext;

  const handleLogin = async () => {
    setIsLoading(true);
    const err = await useLogin();
    if (err) {
      setErrors([...errors, err.message]);
    } else {
      setSuccesses([...successes, "Login Successful!"]);
      setTimeout(() => {
        setErrors([...errors, "Error neh"]);
      }, 1000);
    }
    setIsLoading(false);
  }

  return (
    <div>
      <TopBar>
        <div className="flex flex-row-reverse">
          <Button
            name="button-login"
            className="bg-purple-700 hover:bg-purple-800"
            onClick={handleLogin}>
            {isLoading ? "Loading..." : "Login With Twitch"}
          </Button>
        </div>
      </TopBar>

      <ToastErrorSuccess />
    </div>
  )
}

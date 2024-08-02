import { useCallback, useContext, useEffect } from "react";

import { ErrorContext, IErrorContext } from "@/context/error";
import { ISuccessContext, SuccessContext } from "@/context/success";

import useDebounce from "@/hooks/common/useDebounce";

export default function ToastErrorSuccess() {
  const { errors, setErrors } = useContext(ErrorContext) as IErrorContext;
  const { successes, setSuccesses } = useContext(SuccessContext) as ISuccessContext;

  const debouncedValueError = useDebounce(errors, 5000);
  const debouncedValueSuccess = useDebounce(successes, 5000);

  const hideErrors = useCallback(() => {
    for (let i = 0; i < errors.length; i++) {
      const toastId = `toast_err_${i}`;
      const toast = document.getElementById(toastId);

      if (toast) {
        toast.classList.add("animate-enter");
        setTimeout(() => {
          toast.classList.add("animate-leave");
          setTimeout(() => {
            toast.classList.add("hidden")
          }, 200);
        }, 3000);
      }
    }
  }, [errors])

  const hideSuccesses = useCallback(() => {
    for (let i = 0; i < successes.length; i++) {
      const toastId = `toast_success_${i}`;
      const toast = document.getElementById(toastId);

      if (toast) {
        toast.classList.add("animate-enter");
        setTimeout(() => {
          toast.classList.add("animate-leave");
          setTimeout(() => {
            toast.classList.add("hidden")
          }, 200);
        }, 3000);
      }
    }
  }, [successes])

  const removeErrorToasts = useCallback(() => {
    setErrors([]);
  }, [debouncedValueError])

  const removeSuccessToasts = useCallback(() => {
    setSuccesses([]);
  }, [debouncedValueSuccess])

  useEffect(() => {
    hideErrors();
  }, [hideErrors])

  useEffect(() => {
    hideSuccesses();
  }, [hideSuccesses])

  useEffect(() => {
    removeErrorToasts()
  }, [removeErrorToasts, debouncedValueError])

  useEffect(() => {
    removeSuccessToasts()
  }, [removeSuccessToasts, debouncedValueSuccess])

  return (
    <div className="toast toast-end">
      {errors.length > 0 && (
        errors.map((error, index) => {
          return (
            <div key={index} id={`toast_err_${index}`} className={"alert alert-error"}>
              {error}
            </div>
          )
        })
      )}

      {successes.length > 0 && (
        successes.map((success, index) => {
          return (
            <div key={index} id={`toast_success_${index}`} className={"alert alert-success"}>
              {success}
            </div>
          )
        })
      )}
    </div>
  );
}

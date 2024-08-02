import { createContext, useState } from "react";

export interface IErrorContext {
  errors: string[];
  setErrors: (errors: string[]) => void;
}

const ErrorContext = createContext<IErrorContext | null>(null);

const ErrorProvider = ({ children }: { children: React.ReactNode }) => {
  const [errors, setErrors] = useState<string[]>([]);

  return (
    <ErrorContext.Provider value={{
      errors: errors,
      setErrors: setErrors,
    }}>
      {children}
    </ErrorContext.Provider>
  );
}

export { ErrorContext, ErrorProvider };
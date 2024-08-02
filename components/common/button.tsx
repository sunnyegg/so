import { DOMAttributes } from "react";

export default function Button({
  children,
  className,
  name,
  onClick
}: Readonly<{
  children: React.ReactNode;
  className?: string;
  name?: string;
  onClick?: DOMAttributes<HTMLButtonElement>["onClick"];
}>) {
  return (
    <button
      name={name}
      className={`btn btn-sm text-xs text-white md:btn-md md:text-base ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
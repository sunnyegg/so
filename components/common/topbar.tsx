
export default function TopBar({
  children,
  className,
}: Readonly<{
  children?: React.ReactNode;
  className?: string;
}>) {
  return (
    <div className={`bg-slate-900 p-2 w-full ${className}`}>
      {children}
    </div>
  );
}
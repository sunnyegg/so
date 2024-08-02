
export default function TopBar({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <div className={`bg-base-300 p-2 w-full ${className}`}>
      {children}
    </div>
  );
}
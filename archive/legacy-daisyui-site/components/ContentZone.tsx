type Props = {
  children: React.ReactNode;
  variant?: "default" | "wide";
  className?: string;
};

/** Single centered column: reading width (default) or wide (calendar). Always min-w-0 for nested overflow. */
export function ContentZone({ children, variant = "default", className = "" }: Props) {
  const max = variant === "wide" ? "max-w-6xl lg:max-w-7xl" : "max-w-3xl";
  return (
    <div
      className={`mx-auto flex min-w-0 w-full max-w-full flex-col px-4 py-0 sm:px-6 ${max} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

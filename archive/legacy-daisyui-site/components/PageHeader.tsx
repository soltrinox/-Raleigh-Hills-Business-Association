import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: ReactNode;
  /** default: bordered page intro (inner pages). hero: home band (no bottom rule). minimal: not-found style */
  variant?: "default" | "hero" | "minimal";
  align?: "start" | "center";
  className?: string;
};

const titleBase =
  "font-semibold tracking-tight text-base-content text-2xl sm:text-3xl md:text-4xl";

const descBase = "mt-3 text-base leading-relaxed text-base-content/80 sm:text-lg";

/** One typography scale for every route: same h1 + lead paragraph as inner pages and calendar. */
export function PageHeader({ title, description, variant = "default", align = "start", className = "" }: Props) {
  const hasDesc = description != null && description !== "";
  const isCenter = align === "center";
  const titleCls =
    variant === "hero"
      ? `${titleBase} text-center lg:text-left lg:text-4xl xl:text-5xl`
      : `${titleBase} ${isCenter ? "text-center" : ""}`;

  const descCls =
    variant === "hero"
      ? `${descBase} mx-auto mt-4 max-w-2xl text-base-content/85 text-center lg:mx-0 lg:text-left`
      : `${descBase} max-w-none ${isCenter ? "mx-auto max-w-md text-center" : ""}`;

  const wrapCls =
    variant === "default"
      ? "border-b border-base-300 pb-6"
      : variant === "minimal"
        ? ""
        : "";

  return (
    <header className={`${wrapCls} ${className}`.trim()}>
      <h1 className={titleCls}>{title}</h1>
      {hasDesc ? <p className={descCls}>{description}</p> : null}
    </header>
  );
}

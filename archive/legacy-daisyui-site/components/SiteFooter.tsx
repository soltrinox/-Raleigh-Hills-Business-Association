import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-base-300 bg-base-200 text-base-content">
      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-8 px-4 py-10 text-base leading-relaxed sm:px-6 md:max-w-6xl md:grid-cols-3">
        <aside className="flex min-w-0 flex-col gap-2">
          <p className="font-semibold text-base-content">Raleigh Hills Business Association</p>
          <p className="text-base-content/80">Serving the Raleigh Hills business community.</p>
        </aside>
        <nav className="flex min-w-0 flex-col gap-2" aria-label="Footer">
          <p className="font-semibold text-base-content">Quick links</p>
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/" className="link link-hover link-primary">
                Home
              </Link>
            </li>
            <li>
              <Link href="/calendar" className="link link-hover link-primary">
                Calendar
              </Link>
            </li>
            <li>
              <Link href="https://raleighhillsbusinessassn.org/" className="link link-hover link-primary">
                Original site
              </Link>
            </li>
          </ul>
        </nav>
        <aside className="flex min-w-0 flex-col gap-2 text-base-content/80">
          <p className="font-semibold text-base-content">Contact</p>
          <p>
            For the latest updates and inquiries, visit the{" "}
            <Link href="https://raleighhillsbusinessassn.org/contact-us/" className="link link-primary">
              contact page
            </Link>{" "}
            on the main site.
          </p>
        </aside>
      </div>
    </footer>
  );
}

import Link from "next/link"
import { Mail, MapPin, Phone, Video } from "lucide-react"
import { navConfig, getSiteMetadata } from "@/lib/data"

export function Footer() {
  const site = getSiteMetadata()

  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand Column */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="font-serif text-lg font-bold text-primary-foreground">RH</span>
              </div>
              <span className="font-serif text-xl font-semibold">
                {site.shortName}
              </span>
            </div>
            <p className="mt-4 max-w-md text-background/70 leading-relaxed">
              {site.description}
            </p>
            <div className="mt-6 flex flex-col gap-3 text-background/70">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 mt-0.5 shrink-0" />
                <span>{site.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 shrink-0" />
                <a href={`mailto:${site.email}`} className="hover:text-background transition-colors">
                  {site.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 shrink-0" />
                <a href={`tel:${site.phone}`} className="hover:text-background transition-colors">
                  {site.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 shrink-0" />
                <a href={site.zoomLink} target="_blank" rel="noopener noreferrer" className="hover:text-background transition-colors">
                  Join on Zoom
                </a>
              </div>
            </div>
          </div>

          {/* Dynamic Footer Columns */}
          {navConfig.footer.columns.map((column) => (
            <div key={column.title}>
              <h3 className="font-semibold mb-4">{column.title}</h3>
              <nav className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-background/20 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-background/60">
            &copy; {new Date().getFullYear()} {site.name}. All rights reserved. A registered 501(c)(6) non-profit organization.
          </p>
          <div className="flex gap-6 text-sm text-background/60">
            <Link href="/privacy" className="hover:text-background transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-background transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

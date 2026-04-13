"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ContentRenderer } from "@/components/content-renderer"
import type { ContentBlock } from "@/lib/types"

interface PageTemplateProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
  blocks?: ContentBlock[]
  showContentBlocks?: boolean
  heroImage?: string
}

export function PageTemplate({
  title,
  subtitle,
  children,
  blocks,
  showContentBlocks = true,
  heroImage,
}: PageTemplateProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        {/* Page Header */}
        <section 
          className="relative bg-primary py-16 md:py-24"
          style={heroImage ? { 
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : undefined}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary-foreground mb-4 text-balance">
                {title}
              </h1>
              {subtitle && (
                <p className="text-lg md:text-xl text-primary-foreground/80">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Custom children content */}
              {children}

              {/* Dynamic content blocks from JSON */}
              {showContentBlocks && blocks && blocks.length > 0 && (
                <ContentRenderer blocks={blocks} />
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

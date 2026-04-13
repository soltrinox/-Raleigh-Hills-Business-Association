import type { ReactElement } from "react"
import type { ContentBlock } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"

interface ContentRendererProps {
  blocks: ContentBlock[]
  className?: string
}

export function ContentRenderer({ blocks, className = "" }: ContentRendererProps) {
  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      {blocks.map((block, index) => (
        <ContentBlock key={index} block={block} />
      ))}
    </div>
  )
}

function ContentBlock({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'heading':
      return <Heading level={block.level || 2} text={block.text || ''} />
    
    case 'paragraph':
      return (
        <p className="text-muted-foreground leading-relaxed">
          <RenderTextWithLinks text={block.text || ''} links={block.inlineLinks} />
        </p>
      )
    
    case 'list':
      const ListTag = block.ordered ? 'ol' : 'ul'
      return (
        <ListTag className={`${block.ordered ? 'list-decimal' : 'list-disc'} ml-6 space-y-2 text-muted-foreground`}>
          {block.items?.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ListTag>
      )
    
    case 'image':
      if (!block.src) return null
      return (
        <figure className="my-8">
          <Image
            src={block.src}
            alt={block.alt?.trim() || ""}
            width={800}
            height={400}
            className="rounded-lg w-full h-auto"
          />
        </figure>
      )
    
    case 'hr':
      return <hr className="my-8 border-border" />
    
    default:
      return null
  }
}

function Heading({ level, text }: { level: number; text: string }) {
  if (!text.trim()) return null
  
  const baseClasses = "font-serif text-foreground"
  
  switch (level) {
    case 1:
      return <h1 className={`${baseClasses} text-3xl md:text-4xl font-bold mt-8 mb-4`}>{text}</h1>
    case 2:
      return <h2 className={`${baseClasses} text-2xl md:text-3xl font-bold mt-6 mb-3`}>{text}</h2>
    case 3:
      return <h3 className={`${baseClasses} text-xl md:text-2xl font-semibold mt-4 mb-2`}>{text}</h3>
    case 4:
      return <h4 className={`${baseClasses} text-lg md:text-xl font-semibold mt-4 mb-2`}>{text}</h4>
    case 5:
      return <h5 className={`${baseClasses} text-base md:text-lg font-semibold mt-3 mb-2`}>{text}</h5>
    case 6:
      return <h6 className={`${baseClasses} text-sm md:text-base font-semibold mt-3 mb-2`}>{text}</h6>
    default:
      return <h2 className={`${baseClasses} text-2xl md:text-3xl font-bold mt-6 mb-3`}>{text}</h2>
  }
}

interface InlineLink {
  text: string
  href: string
}

function normalizeHref(href: string): string {
  const t = href.trim()
  if (!t) return "#"
  if (
    t.startsWith("http://") ||
    t.startsWith("https://") ||
    t.startsWith("/") ||
    t.startsWith("#") ||
    t.startsWith("mailto:")
  ) {
    return t
  }
  if (t.includes("@") && !t.includes("://")) {
    return `mailto:${t}`
  }
  return t
}

function RenderTextWithLinks({ text, links }: { text: string; links?: InlineLink[] }) {
  if (!links || links.length === 0) {
    return <>{text}</>
  }

  // Simple rendering - find and replace link text with actual links
  let result = text
  const elements: (string | ReactElement)[] = []
  let lastIndex = 0

  links.forEach((link, i) => {
    const linkIndex = result.indexOf(link.text, lastIndex)
    if (linkIndex !== -1) {
      // Add text before link
      if (linkIndex > lastIndex) {
        elements.push(result.substring(lastIndex, linkIndex))
      }
      const href = normalizeHref(link.href)
      const external = href.startsWith("http://") || href.startsWith("https://")
      // Add the link
      elements.push(
        <Link
          key={i}
          href={href}
          className="text-primary hover:underline"
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
        >
          {link.text}
        </Link>
      )
      lastIndex = linkIndex + link.text.length
    }
  })

  // Add remaining text
  if (lastIndex < result.length) {
    elements.push(result.substring(lastIndex))
  }

  return <>{elements}</>
}

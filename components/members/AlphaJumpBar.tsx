'use client';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

export function AlphaJumpBar({ activeLetters }: { activeLetters: Set<string> }) {
  return (
    <nav
      aria-label="Alphabetical jump bar"
      className="sticky top-16 z-30 flex flex-wrap items-center gap-1 border-b border-border bg-background/95 px-2 py-2 backdrop-blur sm:gap-1.5 sm:px-4"
    >
      {LETTERS.map((letter) => {
        const active = activeLetters.has(letter);
        return (
          <a
            key={letter}
            href={active ? `#letter-${letter}` : undefined}
            className={
              active
                ? 'inline-flex size-8 items-center justify-center rounded-md text-sm font-medium text-primary transition-colors hover:bg-primary/10'
                : 'inline-flex size-8 items-center justify-center rounded-md text-sm font-medium text-muted-foreground/40 cursor-default'
            }
            aria-disabled={!active}
            tabIndex={active ? 0 : -1}
          >
            {letter}
          </a>
        );
      })}
    </nav>
  );
}

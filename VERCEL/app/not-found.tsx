import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
          Page not found
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          That URL is not part of this site yet, or the page was moved.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">Back to home</Link>
        </Button>
      </main>
      <Footer />
    </div>
  );
}

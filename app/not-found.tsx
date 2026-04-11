import Link from "next/link";
import { ContentZone } from "@/components/ContentZone";
import { PageHeader } from "@/components/PageHeader";

export default function NotFound() {
  return (
    <ContentZone>
      <div className="flex min-w-0 flex-col items-center py-12 text-center sm:py-16">
        <PageHeader
          title="Page not found"
          description="That path is not in the mirrored content bundle yet."
          variant="minimal"
          align="center"
          className="max-w-md"
        />
        <Link href="/" className="btn btn-primary mt-10">
          Home
        </Link>
      </div>
    </ContentZone>
  );
}

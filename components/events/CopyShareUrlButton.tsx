"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";

export function CopyShareUrlButton({ url }: { url: string }) {
  const [done, setDone] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      setDone(false);
    }
  }, [url]);

  return (
    <Button type="button" variant="outline" size="sm" className="w-full gap-2" onClick={copy}>
      {done ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {done ? "Copied" : "Copy link"}
    </Button>
  );
}

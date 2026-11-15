"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HomeSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }}
    >
      <Input
        value={query}
        onValueChange={setQuery}
        placeholder="搜尋系統或小工具，例如叫貨、訂位、毛利"
        aria-label="搜尋"
        className="h-11 bg-card"
      />
      <Button type="submit" className="h-11 px-4">
        搜尋
      </Button>
    </form>
  );
}

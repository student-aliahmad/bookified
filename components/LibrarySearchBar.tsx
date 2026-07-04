"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

const LibrarySearchBar = ({ initialQuery }: { initialQuery: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);

  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const nextValue = value.trim();
      const currentValue = params.get("q")?.trim() ?? "";

      if (nextValue === currentValue) {
        return;
      }

      if (nextValue) {
        params.set("q", nextValue);
      } else {
        params.delete("q");
      }

      const nextUrl = params.toString() ? `/?${params.toString()}` : "/";
      router.replace(nextUrl, { scroll: false });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [value, router, searchParams]);

  return (
    <div className="library-search-form">
      <label htmlFor="book-search" className="sr-only">
        Search books by title or author
      </label>

      <div className="library-search-shell">
        <Search className="library-search-icon" />
        <input
          id="book-search"
          name="q"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search books by title or author"
          className="library-search-input"
          aria-label="Search books by title or author"
        />
        {value ? (
          <button
            type="button"
            onClick={() => setValue("")}
            className="ml-1 rounded-full p-1 text-[#9a8f82] transition hover:bg-[#f7f3ec] hover:text-[#212a3b]"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

    </div>
  );
};

export default LibrarySearchBar;

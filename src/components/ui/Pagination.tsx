import React from "react";
import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  queryParams?: Record<string, string | number | boolean | undefined>;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  queryParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, val]) => {
      if (val !== undefined && val !== "" && key !== "page") {
        params.set(key, String(val));
      }
    });
    if (page > 1) {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  // Generate visible page numbers
  const pages: (number | "ellipsis")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("ellipsis");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
  }

  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);

  return (
    <nav
      aria-label="Pagination Navigation"
      className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 px-4 py-4 sm:px-6 mt-8"
    >
      <div className="flex flex-1 justify-between sm:hidden">
        {currentPage > 1 ? (
          <Link
            href={createPageUrl(prevPage)}
            className="relative inline-flex items-center rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Previous
          </Link>
        ) : (
          <span className="relative inline-flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-400 cursor-not-allowed">
            Previous
          </span>
        )}

        <span className="inline-flex items-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Page {currentPage} of {totalPages}
        </span>

        {currentPage < totalPages ? (
          <Link
            href={createPageUrl(nextPage)}
            className="relative inline-flex items-center rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Next
          </Link>
        ) : (
          <span className="relative inline-flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-400 cursor-not-allowed">
            Next
          </span>
        )}
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Showing page <span className="font-semibold text-zinc-900 dark:text-white">{currentPage}</span> of{" "}
            <span className="font-semibold text-zinc-900 dark:text-white">{totalPages}</span>
          </p>
        </div>
        <div>
          <ul className="isolate inline-flex -space-x-px rounded-lg shadow-xs" role="list">
            <li>
              {currentPage > 1 ? (
                <Link
                  href={createPageUrl(prevPage)}
                  className="relative inline-flex items-center rounded-l-lg px-3 py-2 text-zinc-500 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:z-20 focus:outline-offset-0 text-sm font-medium transition-colors"
                  aria-label="Go to previous page"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                  <span className="sr-only">Previous</span>
                </Link>
              ) : (
                <span className="relative inline-flex items-center rounded-l-lg px-3 py-2 text-zinc-300 dark:text-zinc-600 ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 cursor-not-allowed text-sm">
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </span>
              )}
            </li>

            {pages.map((p, idx) => {
              if (p === "ellipsis") {
                return (
                  <li key={`ellipsis-${idx}`}>
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-zinc-500 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700">
                      ...
                    </span>
                  </li>
                );
              }

              const isCurrent = p === currentPage;
              return (
                <li key={p}>
                  <Link
                    href={createPageUrl(p)}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-colors focus:z-20 focus:outline-offset-0 ${
                      isCurrent
                        ? "z-10 bg-indigo-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        : "text-zinc-900 dark:text-zinc-200 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {p}
                  </Link>
                </li>
              );
            })}

            <li>
              {currentPage < totalPages ? (
                <Link
                  href={createPageUrl(nextPage)}
                  className="relative inline-flex items-center rounded-r-lg px-3 py-2 text-zinc-500 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:z-20 focus:outline-offset-0 text-sm font-medium transition-colors"
                  aria-label="Go to next page"
                >
                  <span className="sr-only">Next</span>
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              ) : (
                <span className="relative inline-flex items-center rounded-r-lg px-3 py-2 text-zinc-300 dark:text-zinc-600 ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 cursor-not-allowed text-sm">
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </span>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

"use client";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center gap-3">
          {/* Brand (logo + name) */}
          <Link href="/" className="flex items-center gap-2">
            {/* If you add /public/attendify-logo.svg this will show it; 
               otherwise the SVG fallback below will render. */}
            <span className="inline-block">
              <Image
                src="/attendify-logo.png"
                alt="Attendify"
                width={28}
                height={28}
                className="hidden sm:block"
                onErrorCapture={(e) => {
                  // noop, SVG fallback below covers it visually
                }}
              />
            </span>

            {/* Fallback logo (shown if the image above is missing on small screens) */}
            <svg
              viewBox="0 0 32 32"
              aria-hidden="true"
              className="h-7 w-7 sm:hidden"
            >
              <path d="M6 16a10 10 0 1 1 20 0v6a2 2 0 0 1-2 2h-5v-6h3v-2a6 6 0 1 0-12 0v2h3v6H8a2 2 0 0 1-2-2z" />
            </svg>

            <span className="text-xl font-semibold tracking-tight">Attendify</span>
          </Link>

          {/* Right side (optional) */}
          <nav className="ml-auto flex items-center gap-4">
            {/* <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">About</Link> */}
          </nav>
        </div>
      </div>
    </header>
  );
}

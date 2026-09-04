import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-zinc-500 md:flex-row md:px-6">
        <p>
          &copy; {new Date().getFullYear()} conmeet<span className="text-accent">.moe</span>
        </p>

        <div className="flex items-center gap-6">
          <Link href="/privacy" className="hover:text-accent transition-colors">
            Privacy Policy
          </Link>
          <Link href="/contact" className="hover:text-accent transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}

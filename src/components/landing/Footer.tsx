import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-800 text-slate-400">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-sm">
          &copy; {currentYear} Real Insurance. All rights reserved.
        </p>
        <p className="text-xs mt-2">
          This is a sample landing page for demonstration purposes. Real Insurance is a registered trademark.
        </p>
        <div className="mt-4 space-x-4">
          <Link href="#" className="text-xs hover:text-primary-foreground transition-colors">Privacy Policy</Link>
          <Link href="#" className="text-xs hover:text-primary-foreground transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}

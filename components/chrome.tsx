import Link from "next/link";
import { site } from "@/content/site";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { href: "/#work", label: "Work" },
  { href: "/#experience", label: "Experience" },
  { href: "/#about", label: "About" },
  { href: "/resume", label: "Résumé" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-10 border-b border-rule bg-paper/90 backdrop-blur print:hidden">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3 sm:px-10"
      >
        <Link href="/" className="font-semibold tracking-tight">
          {site.name}
        </Link>
        <ul className="flex items-center gap-4 text-sm sm:gap-7">
          {links.map((l) => (
            <li key={l.href} className={l.label === "Experience" || l.label === "About" ? "hidden sm:block" : ""}>
              <Link href={l.href} className="text-pencil hover:text-ink">
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <ThemeToggle />
          </li>
        </ul>
      </nav>
    </header>
  );
}

export function ContactLinks({ className = "" }: { className?: string }) {
  const items = [
    ...(site.email ? [{ href: `mailto:${site.email}`, label: site.email }] : []),
    { href: site.linkedin, label: "LinkedIn" },
    { href: site.github, label: "GitHub" },
  ];
  return (
    <ul className={`flex flex-wrap gap-x-8 gap-y-3 ${className}`}>
      {items.map((i) => (
        <li key={i.href}>
          <a href={i.href} className="link">
            {i.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-rule print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 sm:px-10">
        <p className="tag">
          {site.name} / {site.location}
        </p>
        <ContactLinks className="text-sm" />
      </div>
    </footer>
  );
}

/** A page section: a mono tag in the margin, content beside it. */
export function Section({
  id,
  index,
  label,
  children,
}: {
  id: string;
  index: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-20 border-t border-rule py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 sm:px-10 lg:grid-cols-[11rem_1fr]">
        <h2 id={`${id}-h`} className="tag">
          <span className="text-signal">{index}</span> / {label}
        </h2>
        <div>{children}</div>
      </div>
    </section>
  );
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

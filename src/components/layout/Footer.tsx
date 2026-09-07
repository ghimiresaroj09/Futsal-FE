import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

import { Logo } from "@/components/common/Logo";
import { publicNavItems } from "@/config/nav";
import { useFutsalStore } from "@/store/futsal-store";

/** Brand icons (lucide no longer ships these) — stroke styled to match lucide. */
function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const socials = [
  { label: "Facebook", href: "#", icon: FacebookIcon },
  { label: "Instagram", href: "#", icon: InstagramIcon },
  { label: "X (Twitter)", href: "#", icon: XIcon },
];

export function Footer() {
  const futsal = useFutsalStore((s) => s.futsal);
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 md:grid-cols-3 md:px-6">
        {/* Brand */}
        <div className="space-y-4 md:pr-8">
          <Logo />
          <p className="text-muted-foreground text-sm leading-relaxed">
            Kathmandu's home of futsal — two premium courts, real-time online
            booking and a community that lives for the game.
          </p>
          <div className="flex items-center gap-2">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-9 items-center justify-center rounded-md transition-colors"
              >
                <social.icon />
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="text-sm font-semibold">Quick Links</h3>
          <ul className="mt-4 space-y-2.5">
            {publicNavItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-semibold">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="text-muted-foreground flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {futsal
                ? `${futsal.address}, ${futsal.location}`
                : "Balaju Height, Kathmandu, Nepal"}
            </li>
            <li className="text-muted-foreground flex items-center gap-2.5">
              <Phone className="size-4 shrink-0" aria-hidden="true" />
              {futsal?.phone ?? "+977 9800000000"}
            </li>
            <li className="text-muted-foreground flex items-center gap-2.5">
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              {futsal?.email ?? "hello@nexusfms.com"}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="text-muted-foreground mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs sm:flex-row md:px-6">
          <p>© {new Date().getFullYear()} Nexus FMS. All rights reserved.</p>
          <p>Book. Play. Repeat. ⚽</p>
        </div>
      </div>
    </footer>
  );
}

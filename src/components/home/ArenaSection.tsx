import { useEffect, useState } from "react";
import { ArrowRightIcon, CheckCircle2Icon } from "lucide-react";

import { formatTime12h } from "@/lib/format";
import { useFutsalStore } from "@/store/futsal-store";

const arenaImages = [
  {
    src: "/images/venue-indoor.jpg",
    alt: "Nexus Futsal's indoor court with fresh green turf",
  },
  { src: "/images/venue-rooftop.jpg", alt: "The rooftop court at golden hour" },
  { src: "/images/venue-outdoor.jpg", alt: "The outdoor pitch on game day" },
  { src: "/images/hero.jpg", alt: "Match night at Nexus" },
  { src: "/images/action-1.jpg", alt: "Skills on display" },
  { src: "/images/action-2.jpg", alt: "Post-match celebrations" },
];

/**
 * "The Arena" split section — photo carousel on the left (big frame shows
 * the current photo, the small overlapping frame previews the next one;
 * clicking the preview or waiting 4s advances), facility checklist and
 * practical info on the right.
 */
export function ArenaSection() {
  const [index, setIndex] = useState(0);
  const futsal = useFutsalStore((s) => s.futsal);
  const total = arenaImages.length;

  const current = arenaImages[index]!;
  const next = arenaImages[(index + 1) % total]!;

  const closing = formatTime12h(futsal?.closing_time ?? "22:00:00");
  const opening = formatTime12h(futsal?.opening_time ?? "06:00:00");
  const price = Number(futsal?.price_per_slot ?? 1200).toLocaleString();
  const slotMinutes = futsal?.slot_duration ?? 60;
  const place = futsal
    ? `${futsal.address}, ${futsal.location}`
    : "Balaju Height, Kathmandu";

  const highlights = [
    "FIFA-quality imported turf",
    `Floodlights until ${closing}`,
    "Changing rooms & hot showers",
    "Free Wi-Fi & spectator lounge",
    "Bibs, balls & equipment provided",
    "Ample free parking",
  ];

  const advance = () => setIndex((i) => (i + 1) % total);

  // Auto-advance every 5s; manual clicks restart the timer.
  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % total), 5000);
    return () => clearInterval(timer);
  }, [index, total]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-24 pb-20 md:px-6">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* Carousel collage */}
        <div className="relative">
          <div className="overflow-hidden rounded-3xl border shadow-lg">
            <img
              key={current.src}
              src={current.src}
              alt={current.alt}
              loading="lazy"
              className="animate-in fade-in zoom-in-95 aspect-[4/3] w-full object-cover duration-500"
            />
          </div>

          {/* Next-up preview — click to swap into the big frame */}
          <button
            type="button"
            onClick={advance}
            aria-label={`Show next photo: ${next.alt}`}
            className="group absolute -right-4 -bottom-10 hidden w-2/5 cursor-pointer overflow-hidden rounded-2xl border-4 border-background shadow-xl transition-transform duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 hover:-translate-y-1 sm:block"
          >
            <img
              key={next.src}
              src={next.src}
              alt={next.alt}
              loading="lazy"
              className="animate-in fade-in aspect-[4/3] w-full object-cover duration-500"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <ArrowRightIcon
                className="text-white size-6 drop-shadow"
                aria-hidden="true"
              />
            </span>
          </button>

          <span className="bg-primary text-primary-foreground absolute -top-4 left-6 rounded-full px-4 py-1.5 text-xs font-semibold shadow-md">
            Since 2018
          </span>
        </div>

        {/* Copy */}
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-primary text-sm font-semibold tracking-wide uppercase">
              The Arena
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              One arena. Built for the game.
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              Tucked away in {futsal?.address ?? "Balaju Height"}
              {futsal?.location ? `, ${futsal.location}` : ""},{" "}
              {futsal?.name ?? "Nexus Futsal"} is run by players, for players.
              Two meticulously maintained courts, quality gear and a space
              that's always match-ready — whether it's a casual kickabout or a
              cup final.
            </p>
          </div>

          <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {highlights.map((highlight) => (
              <li key={highlight} className="flex items-center gap-2.5 text-sm">
                <CheckCircle2Icon
                  className="text-primary size-4 shrink-0"
                  aria-hidden="true"
                />
                {highlight}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            <span className="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium">
              🕕 Open {opening} – {closing}, every day
            </span>
            <span className="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium">
              💵 Rs {price} / {slotMinutes} min
            </span>
            <span className="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium">
              📍 {place}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

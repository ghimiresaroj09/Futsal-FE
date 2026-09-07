import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

const shots = [
  {
    src: "/images/hero.jpg",
    alt: "Match night at Nexus",
    ratio: "aspect-[4/3]",
  },
  {
    src: "/images/action-1.jpg",
    alt: "Skills on display",
    ratio: "aspect-[3/4]",
  },
  {
    src: "/images/venue-rooftop.jpg",
    alt: "Golden hour over the court",
    ratio: "aspect-square",
  },
  {
    src: "/images/action-2.jpg",
    alt: "Post-match celebrations",
    ratio: "aspect-[4/5]",
  },
  {
    src: "/images/venue-outdoor.jpg",
    alt: "Game day at the arena",
    ratio: "aspect-[3/4]",
  },
  {
    src: "/images/venue-indoor.jpg",
    alt: "Match-ready turf",
    ratio: "aspect-[4/3]",
  },
  {
    src: "/images/floodlights.jpg",
    alt: "Floodlights ready for kickoff",
    ratio: "aspect-[4/5]",
  },
  {
    src: "/images/celebration.jpg",
    alt: "Celebrating with the squad",
    ratio: "aspect-square",
  },
];

/**
 * Gallery preview as a masonry collage: varied photo heights laid out in
 * CSS columns, hover zoom and chip captions, with a section header that
 * left-aligns the copy and pushes the CTA to the right.
 */
export function GalleryPreview() {
  return (
    <section className="border-t">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6 md:py-20">
        {/* Section header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-primary text-sm font-semibold tracking-wide uppercase">
              Gallery
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Straight off our turf
            </h2>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Matches, skills and celebrations from the Nexus community.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground rounded-full border px-3 py-1 text-xs font-medium">
              +120 photos
            </span>
            <Button asChild variant="outline">
              <Link to="/gallery">
                View full gallery
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Masonry collage */}
        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
          {shots.map((shot) => (
            <figure
              key={shot.src + shot.alt}
              className="group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md"
            >
              <img
                src={shot.src}
                alt={shot.alt}
                loading="lazy"
                className={`${shot.ratio} w-full object-cover transition-transform duration-500 group-hover:scale-105`}
              />
              <figcaption className="bg-background/85 text-foreground/80 absolute bottom-2 left-2 translate-y-1 rounded-full px-2.5 py-1 text-[11px] font-semibold opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {shot.alt}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

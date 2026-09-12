import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/format";
import { fetchTestimonials } from "@/lib/api/testimonials";
import type { Testimonial } from "@/types/testimonial";

/** Visual position of a card in the pile: 0 = front, 1/2 = peeking behind. */
const LAYER_TRANSFORMS = [
  "translateY(1.75rem) scale(1) rotate(0deg)",
  "translateY(0.875rem) scale(0.96) rotate(2deg)",
  "translateY(0) scale(0.92) rotate(-2.5deg)",
];

function layerStyle(depth: number, total: number): CSSProperties {
  const layer = Math.min(depth, 2);
  const hidden = depth > 2;

  return {
    transform: LAYER_TRANSFORMS[layer],
    opacity: hidden ? 0 : 1 - layer * 0.15,
    zIndex: total - depth,
    pointerEvents: hidden ? "none" : "auto",
  };
}

/**
 * Testimonials as a compact stack of cards: the active quote is on top,
 * the next two peek out behind it. Click a card to bring it to the front.
 */
export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const total = testimonials.length;

  // Fetch testimonials from API
  useEffect(() => {
    let cancelled = false;
    
    fetchTestimonials()
      .then((data) => {
        if (!cancelled) {
          setTestimonials(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTestimonials([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const goTo = (next: number) => setIndex(((next % total) + total) % total);

  // Auto-advance every 7s
  useEffect(() => {
    if (total === 0) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % total), 7000);
    return () => clearInterval(timer);
  }, [index, total]);

  const handleCardClick = (cardIndex: number) => {
    goTo(cardIndex === index ? index + 1 : cardIndex);
  };

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <Skeleton className="mx-auto h-4 w-24 mb-2" />
          <Skeleton className="mx-auto h-10 w-64" />
        </div>

        <div className="relative mx-auto h-[300px] max-w-xl sm:h-[280px]">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute inset-x-0 top-0 transition-all duration-300"
              style={layerStyle(i, 3)}
            >
              <Card className="overflow-hidden rounded-xl border shadow-lg">
                <div className="bg-primary h-1 w-full" />
                <CardContent className="flex flex-col items-center gap-3 p-5 text-center sm:p-6">
                  <Skeleton className="h-16 w-full" />
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="size-9 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="size-8 rounded-full" />
        </div>
      </section>
    );
  }

  // Don't render if no testimonials
  if (total === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          Testimonials
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          What our players say
        </h2>
      </div>

      {/* The stack */}
      <div
        role="group"
        aria-label="Testimonial cards"
        className="relative mx-auto h-[300px] max-w-xl sm:h-[280px]"
      >
        {testimonials.map((testimonial, cardIndex) => {
          const depth = (cardIndex - index + total) % total;

          return (
            <div
              key={testimonial.id}
              className="absolute inset-x-0 top-0 cursor-pointer transition-all duration-300 ease-out focus-visible:outline-none"
              style={layerStyle(depth, total)}
              role="button"
              tabIndex={depth <= 2 ? 0 : -1}
              aria-label={`Testimonial from ${testimonial.full_name}${depth === 0 ? " (top of stack)" : ""}`}
              onClick={() => handleCardClick(cardIndex)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleCardClick(cardIndex);
                }
              }}
            >
              <Card className="overflow-hidden rounded-xl border shadow-lg shadow-primary/5">
                {/* purple "file tab" strip */}
                <div className="bg-primary h-1 w-full" aria-hidden="true" />

                <CardContent className="flex flex-col items-center gap-3 p-5 text-center sm:p-6">
                  <blockquote className="text-sm leading-relaxed text-balance sm:text-base">
                    {testimonial.content}
                  </blockquote>

                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-9">
                      {testimonial.image_url && (
                        <AvatarImage 
                          src={testimonial.image_url} 
                          alt={testimonial.full_name}
                        />
                      )}
                      <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-semibold">
                        {getInitials(testimonial.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-semibold">
                        {testimonial.full_name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {testimonial.title}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="mt-5 flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="size-8 rounded-full"
          onClick={() => goTo(index - 1)}
          aria-label="Previous testimonial"
        >
          <ChevronLeftIcon />
        </Button>
        <p className="text-muted-foreground min-w-12 text-center text-xs font-medium tabular-nums">
          {index + 1} / {total}
        </p>
        <Button
          variant="outline"
          size="icon"
          className="size-8 rounded-full"
          onClick={() => goTo(index + 1)}
          aria-label="Next testimonial"
        >
          <ChevronRightIcon />
        </Button>
      </div>
      <p className="text-muted-foreground/70 mt-2.5 text-center text-xs">
        Tap the stack to deal the next card
      </p>
    </section>
  );
}

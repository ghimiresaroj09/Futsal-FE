import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchGalleryImages } from "@/lib/api/gallery";
import type { GalleryImage } from "@/types/gallery";

/**
 * Gallery preview as a masonry collage: varied photo heights laid out in
 * CSS columns, hover zoom and chip captions, with a section header that
 * left-aligns the copy and pushes the CTA to the right.
 */
export function GalleryPreview() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleryImages({ page: 1 })
      .then((data) => {
        setImages(data.results.slice(0, 8));
        setTotalCount(data.count);
        setLoading(false);
      })
      .catch(() => {
        setImages([]);
        setTotalCount(0);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="border-t">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-5 w-96" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>

          <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton 
                key={i} 
                className={`mb-3 w-full rounded-2xl ${i % 3 === 0 ? 'h-64' : i % 2 === 0 ? 'h-48' : 'h-56'}`}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return null;
  }

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
              {totalCount}+ photos
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
          {images.map((image) => (
            <figure
              key={image.id}
              className="group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md"
            >
              <img
                src={image.image_url}
                alt={image.alt_text || image.title}
                loading="lazy"
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <figcaption className="bg-background/85 text-foreground/80 absolute bottom-2 left-2 translate-y-1 rounded-full px-2.5 py-1 text-[11px] font-semibold opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {image.title}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExpandIcon,
  LoaderCircleIcon,
  PlayIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { fetchGalleryImages, fetchGalleryCategories, fetchGalleryHighlights } from "@/lib/api/gallery";
import type { GalleryImage, GalleryCategory, GalleryHighlight } from "@/types/gallery";

export function GalleryPage() {
  useDocumentTitle("Gallery");
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [highlights, setHighlights] = useState<GalleryHighlight[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // UUID
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch categories
  useEffect(() => {
    fetchGalleryCategories()
      .then((data) => {
        setCategories(data.results.filter((cat) => cat.is_active));
      })
      .catch(() => {
        setCategories([]);
      });
  }, []);

  // Fetch highlights
  useEffect(() => {
    fetchGalleryHighlights()
      .then((data) => {
        setHighlights(data.results.filter((h) => h.is_active));
      })
      .catch(() => {
        setHighlights([]);
      });
  }, []);

  // Fetch images when category or page changes
  useEffect(() => {
    const isInitialLoad = page === 1;
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    fetchGalleryImages({
      page,
      category: selectedCategory || undefined,
    })
      .then((data) => {
        if (page === 1) {
          setImages(data.results);
        } else {
          setImages((prev) => [...prev, ...data.results]);
        }
        setHasMore(!!data.next);
      })
      .catch(() => {
        if (page === 1) {
          setImages([]);
        }
        setHasMore(false);
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  }, [selectedCategory, page]);

  // Reset to page 1 when category changes
  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const currentPhotoIndex = images.findIndex((item) => item.id === selectedId);
  const currentPhoto = currentPhotoIndex >= 0 ? images[currentPhotoIndex] : null;

  const showItem = (offset: 1 | -1) => {
    if (currentPhotoIndex < 0 || images.length === 0) return;
    const next = (currentPhotoIndex + offset + images.length) % images.length;
    setSelectedId(images[next].id);
  };

  const currentVideoIndex = highlights.findIndex(
    (video) => video.id === selectedVideoId,
  );
  const currentVideo =
    currentVideoIndex >= 0 ? highlights[currentVideoIndex] : null;

  const showVideo = (offset: 1 | -1) => {
    if (currentVideoIndex < 0 || highlights.length === 0) return;
    const next =
      (currentVideoIndex + offset + highlights.length) % highlights.length;
    setSelectedVideoId(highlights[next].id);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6">
      {/* Page header */}
      <div className="mx-auto max-w-2xl space-y-3 text-center">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          Gallery
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          The arena, up close
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Match nights, coaching mornings and the turf itself — a little eye
          candy from around Nexus. It looks even better in person.
        </p>
      </div>

      {/* Filters */}
      <div
        className="mt-8 flex flex-wrap items-center justify-center gap-2"
        role="group"
        aria-label="Filter gallery"
      >
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          className="cursor-pointer rounded-full"
          onClick={() => handleCategoryChange(null)}
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            className="cursor-pointer rounded-full"
            onClick={() => handleCategoryChange(cat.id)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="mt-12 flex flex-col items-center justify-center gap-3 py-16">
          <LoaderCircleIcon
            className="text-muted-foreground size-8 animate-spin"
            aria-hidden="true"
          />
          <p className="text-muted-foreground text-sm">Loading gallery…</p>
        </div>
      ) : images.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            No images found for this category.
          </p>
        </div>
      ) : (
        <>
          {/* Gallery grid - Pinterest-style masonry */}
          <div className="mt-8 columns-2 gap-3 sm:columns-3 lg:columns-4">
            {images.map((item) => (
              <button
                key={item.id}
                type="button"
                className="group relative mb-3 block w-full overflow-hidden rounded-2xl border bg-muted transition-all hover:scale-[1.02] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={() => setSelectedId(item.id)}
              >
                <img
                  src={item.image_url}
                  alt={item.alt_text || item.title}
                  loading="lazy"
                  className="w-full transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="text-xs font-medium text-white drop-shadow">
                    {item.title}
                  </p>
                  <p className="text-muted mt-0.5 text-[10px] text-white/80">
                    {item.category_name}
                  </p>
                </div>
                <div className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <ExpandIcon
                    className="size-3.5 text-white"
                    aria-hidden="true"
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Load more button */}
          {hasMore && (
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="cursor-pointer"
              >
                {loadingMore ? (
                  <>
                    <LoaderCircleIcon
                      className="mr-2 size-4 animate-spin"
                      aria-hidden="true"
                    />
                    Loading…
                  </>
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Highlights & clips */}
      {highlights.length > 0 && (
        <section className="mt-16">
          <div className="mx-auto mb-6 max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              Highlights & clips
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Short clips from around the arena — press play.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((video) => (
              <button
                key={video.id}
                type="button"
                className="group relative aspect-video overflow-hidden rounded-2xl border bg-muted transition-all hover:scale-[1.02] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={() => setSelectedVideoId(video.id)}
              >
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 transition-opacity group-hover:bg-black/50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all group-hover:scale-110 group-hover:bg-white">
                    <PlayIcon
                      className="text-primary ml-0.5 size-7"
                      fill="currentColor"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-4">
                  <p className="text-sm font-medium text-white">
                    {video.title}
                  </p>
                  {video.tags && (
                    <p className="mt-1 text-xs text-white/70">{video.tags}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* CTA to bookings */}
      <div className="mt-12 rounded-3xl border bg-gradient-to-br from-card via-card to-muted p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold tracking-tight">
          Ready to play here?
        </h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
          Lock in your court time now — bookings are open, and the turf is
          waiting.
        </p>
        <Button asChild className="mt-4 cursor-pointer">
          <Link to="/bookings">Book your slot</Link>
        </Button>
      </div>

      {/* Lightbox for photos */}
      <Dialog open={!!currentPhoto} onOpenChange={() => setSelectedId(null)}>
        <DialogContent className="max-w-3xl p-0">
          <DialogTitle className="sr-only">
            {currentPhoto?.title || "Gallery image"}
          </DialogTitle>
          {currentPhoto && (
            <div className="relative">
              <img
                src={currentPhoto.image_url}
                alt={currentPhoto.alt_text || currentPhoto.title}
                className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain mx-auto"
              />
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/50 to-transparent p-6 text-white">
                <h3 className="text-lg font-semibold">
                  {currentPhoto.title}
                </h3>
                <p className="mt-1 text-sm text-white/80">
                  {currentPhoto.category_name}
                </p>
              </div>
              {images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full"
                    onClick={() => showItem(-1)}
                    aria-label="Previous image"
                  >
                    <ChevronLeftIcon />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full"
                    onClick={() => showItem(1)}
                    aria-label="Next image"
                  >
                    <ChevronRightIcon />
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lightbox for videos */}
      <Dialog open={!!currentVideo} onOpenChange={() => setSelectedVideoId(null)}>
        <DialogContent className="max-w-xl p-0">
          <DialogTitle className="sr-only">
            {currentVideo?.title || "Video highlight"}
          </DialogTitle>
          {currentVideo && (
            <div className="relative">
              <video
                key={currentVideo.id}
                src={currentVideo.video_url}
                controls
                playsInline
                className="w-full rounded-t-lg max-h-[70vh]"
                poster={currentVideo.thumbnail_url}
              >
                Your browser does not support the video tag.
              </video>
              <div className="bg-card p-4 rounded-b-lg">
                <h3 className="text-base font-semibold">{currentVideo.title}</h3>
                {currentVideo.tags && (
                  <p className="text-muted-foreground mt-1 text-sm">
                    {currentVideo.tags}
                  </p>
                )}
              </div>
              {highlights.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/3 -translate-y-1/2 cursor-pointer rounded-full shadow-lg"
                    onClick={() => showVideo(-1)}
                    aria-label="Previous video"
                  >
                    <ChevronLeftIcon />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/3 -translate-y-1/2 cursor-pointer rounded-full shadow-lg"
                    onClick={() => showVideo(1)}
                    aria-label="Next video"
                  >
                    <ChevronRightIcon />
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

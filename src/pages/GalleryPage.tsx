import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExpandIcon,
  PlayIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useDocumentTitle } from "@/hooks/use-document-title";

type GalleryCategory = "Venue" | "Matches" | "Community";

interface GalleryItem {
  id: string;
  src: string;
  title: string;
  category: GalleryCategory;
  aspect: string;
  imageClass?: string;
}

const galleryItems: GalleryItem[] = [
  {
    id: "hero",
    src: "/images/hero.jpg",
    title: "Kickoff under the lights",
    category: "Matches",
    aspect: "aspect-[16/10]",
  },
  {
    id: "venue-indoor",
    src: "/images/venue-indoor.jpg",
    title: "The indoor court",
    category: "Venue",
    aspect: "aspect-[3/4]",
  },
  {
    id: "action-2",
    src: "/images/action-2.jpg",
    title: "Midfield battle",
    category: "Matches",
    aspect: "aspect-square",
  },
  {
    id: "floodlights",
    src: "/images/floodlights.jpg",
    title: "Floodlights on",
    category: "Venue",
    aspect: "aspect-[4/5]",
  },
  {
    id: "celebration",
    src: "/images/celebration.jpg",
    title: "That goal feeling",
    category: "Community",
    aspect: "aspect-[4/3]",
  },
  {
    id: "venue-outdoor",
    src: "/images/venue-outdoor.jpg",
    title: "The outdoor court",
    category: "Venue",
    aspect: "aspect-[4/3]",
  },
  {
    id: "action-1",
    src: "/images/action-1.jpg",
    title: "Saved!",
    category: "Matches",
    aspect: "aspect-[4/3]",
  },
  {
    id: "coaching",
    src: "/images/coaching.jpg",
    title: "Saturday coaching",
    category: "Community",
    aspect: "aspect-[3/4]",
  },
  {
    id: "turf",
    src: "/images/turf.jpg",
    title: "Fresh turf, morning light",
    category: "Venue",
    aspect: "aspect-square",
  },
  {
    id: "venue-rooftop",
    src: "/images/venue-rooftop.jpg",
    title: "Court with a view",
    category: "Venue",
    aspect: "aspect-[16/10]",
  },
  {
    id: "hero-kickoff",
    src: "/images/hero.jpg",
    title: "First whistle",
    category: "Matches",
    aspect: "aspect-square",
    imageClass: "object-[65%_center]",
  },
  {
    id: "coaching-huddle",
    src: "/images/coaching.jpg",
    title: "Team talk",
    category: "Community",
    aspect: "aspect-[16/10]",
    imageClass: "object-[center_30%]",
  },
];

const FILTERS = ["All", "Venue", "Matches", "Community"] as const;
type Filter = (typeof FILTERS)[number];

interface GalleryVideo {
  id: string;
  src: string;
  poster: string;
  title: string;
  category: GalleryCategory;
  duration: string;
}

const galleryVideos: GalleryVideo[] = [
  {
    id: "v-floodlights",
    src: "/videos/floodlights.mp4",
    poster: "/images/floodlights.jpg",
    title: "Floodlights on at dusk",
    category: "Venue",
    duration: "0:06",
  },
  {
    id: "v-action",
    src: "/videos/action.mp4",
    poster: "/images/action-2.jpg",
    title: "Match night intensity",
    category: "Matches",
    duration: "0:06",
  },
  {
    id: "v-coaching",
    src: "/videos/coaching.mp4",
    poster: "/images/coaching.jpg",
    title: "Little legs, big dreams",
    category: "Community",
    duration: "0:06",
  },
];

export function GalleryPage() {
  useDocumentTitle("Gallery");
  const [filter, setFilter] = useState<Filter>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const items =
    filter === "All"
      ? galleryItems
      : galleryItems.filter((item) => item.category === filter);

  const currentPhotoIndex = items.findIndex((item) => item.id === selectedId);
  const currentPhoto = currentPhotoIndex >= 0 ? items[currentPhotoIndex] : null;

  const showItem = (offset: 1 | -1) => {
    if (currentPhotoIndex < 0 || items.length === 0) return;
    const next = (currentPhotoIndex + offset + items.length) % items.length;
    setSelectedId(items[next].id);
  };

  const currentVideoIndex = galleryVideos.findIndex(
    (video) => video.id === selectedVideoId,
  );
  const currentVideo =
    currentVideoIndex >= 0 ? galleryVideos[currentVideoIndex] : null;

  const showVideo = (offset: 1 | -1) => {
    if (currentVideoIndex < 0 || galleryVideos.length === 0) return;
    const next =
      (currentVideoIndex + offset + galleryVideos.length) %
      galleryVideos.length;
    setSelectedVideoId(galleryVideos[next].id);
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
        {FILTERS.map((option) => (
          <Button
            key={option}
            variant={filter === option ? "default" : "outline"}
            size="sm"
            className="cursor-pointer rounded-full"
            aria-pressed={filter === option}
            onClick={() => setFilter(option)}
          >
            {option === "Venue"
              ? "Our Venue"
              : option === "Matches"
                ? "Match Nights"
                : option}
          </Button>
        ))}
      </div>

      {/* Masonry grid */}
      <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedId(item.id)}
            aria-label={`View photo: ${item.title}`}
            className={`group relative mb-4 block w-full cursor-pointer overflow-hidden rounded-2xl border break-inside-avoid ${item.aspect}`}
          >
            <img
              src={item.src}
              alt={item.title}
              loading="lazy"
              draggable={false}
              className={`absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105 ${item.imageClass ?? ""}`}
            />
            {/* Hover scrim + caption */}
            <span className="from-black/0 via-black/0 to-black/60 absolute inset-0 bg-linear-to-t opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="text-left">
                <span className="block text-sm font-semibold text-white">
                  {item.title}
                </span>
                <span className="block text-xs text-white/70">
                  {item.category}
                </span>
              </span>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm">
                <ExpandIcon className="size-4" aria-hidden="true" />
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Videos */}
      <section className="mt-14">
        <div className="mb-6 max-w-xl">
          <h2 className="text-2xl font-bold tracking-tight">
            Highlights & clips
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Short clips from around the arena — press play.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleryVideos.map((video) => (
            <button
              key={video.id}
              type="button"
              onClick={() => setSelectedVideoId(video.id)}
              aria-label={`Play video: ${video.title}`}
              className="group relative aspect-video w-full cursor-pointer overflow-hidden rounded-2xl border"
            >
              <img
                src={video.poster}
                alt=""
                loading="lazy"
                draggable={false}
                className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="from-black/0 via-black/10 to-black/60 absolute inset-0 bg-linear-to-t" />
              {/* Play button */}
              <span className="absolute inset-0 m-auto flex size-14 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg transition-transform duration-300 group-hover:scale-110">
                <PlayIcon
                  className="size-6 translate-x-0.5 fill-current"
                  aria-hidden="true"
                />
              </span>
              {/* Duration + caption */}
              <span className="absolute top-3 right-3 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white tabular-nums backdrop-blur-sm">
                {video.duration}
              </span>
              <span className="absolute inset-x-0 bottom-0 p-4 text-left">
                <span className="block text-sm font-semibold text-white">
                  {video.title}
                </span>
                <span className="block text-xs text-white/70">
                  {video.category}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Photo lightbox */}
      <Dialog
        open={currentPhoto !== null}
        onOpenChange={(open) => (!open ? setSelectedId(null) : undefined)}
      >
        <DialogContent className="sm:max-w-3xl">
          {currentPhoto ? (
            <>
              <DialogTitle className="sr-only">
                {currentPhoto.title}
              </DialogTitle>
              <img
                src={currentPhoto.src}
                alt={currentPhoto.title}
                className="max-h-[70vh] w-full rounded-xl object-contain"
                draggable={false}
              />
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {currentPhoto.title}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {currentPhoto.category} · {currentPhotoIndex + 1} of{" "}
                    {items.length}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 cursor-pointer"
                    aria-label="Previous photo"
                    onClick={() => showItem(-1)}
                  >
                    <ChevronLeftIcon />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 cursor-pointer"
                    aria-label="Next photo"
                    onClick={() => showItem(1)}
                  >
                    <ChevronRightIcon />
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Video lightbox */}
      <Dialog
        open={currentVideo !== null}
        onOpenChange={(open) => (!open ? setSelectedVideoId(null) : undefined)}
      >
        <DialogContent className="sm:max-w-3xl">
          {currentVideo ? (
            <>
              <DialogTitle className="sr-only">
                {currentVideo.title}
              </DialogTitle>
              <video
                key={currentVideo.id}
                src={currentVideo.src}
                poster={currentVideo.poster}
                controls
                autoPlay
                playsInline
                className="max-h-[70vh] w-full rounded-xl bg-black"
              />
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {currentVideo.title}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {currentVideo.category} · {currentVideo.duration} ·{" "}
                    {currentVideoIndex + 1} of {galleryVideos.length}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 cursor-pointer"
                    aria-label="Previous video"
                    onClick={() => showVideo(-1)}
                  >
                    <ChevronLeftIcon />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 cursor-pointer"
                    aria-label="Next video"
                    onClick={() => showVideo(1)}
                  >
                    <ChevronRightIcon />
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Closing CTA */}
      <div className="mx-auto mt-6 max-w-2xl text-center">
        <p className="text-sm font-semibold tracking-tight">
          Pictures are nice. Playing is nicer.
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          Grab a slot, bring your squad and make your own highlight reel.
        </p>
        <Button asChild className="mt-4 cursor-pointer">
          <Link to="/bookings">Book a Slot</Link>
        </Button>
      </div>
    </div>
  );
}

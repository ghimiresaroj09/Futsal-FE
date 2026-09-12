import { useRef, useEffect, useState, type PointerEvent } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  UsersIcon,
  TagsIcon,
  HandshakeIcon,
  BuildingIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { getInitials } from "@/lib/format";
import { useFutsalStore } from "@/store/futsal-store";
import { fetchAboutHeroSection } from "@/lib/api/about-hero";
import { fetchAboutStorySection } from "@/lib/api/about-story";
import { fetchAboutCommunitySection } from "@/lib/api/about-community";
import type { AboutHeroSection } from "@/types/about-hero";
import type { AboutStorySection } from "@/types/about-story";
import type { AboutCommunitySection } from "@/types/about-community";
import type { LucideIcon } from "lucide-react";

// Map Font Awesome icon codes to Lucide icons
const iconMap: Record<string, LucideIcon> = {
  "fa-solid fa-tags": TagsIcon,
  "fa-solid fa-handshake": HandshakeIcon,
  "fa-solid fa-building": BuildingIcon,
  "fa-solid fa-people-group": UsersIcon,
};

export function AboutPage() {
  useDocumentTitle("About Us");
  const futsal = useFutsalStore((s) => s.futsal);
  const [heroData, setHeroData] = useState<AboutHeroSection | null>(null);
  const [storyData, setStoryData] = useState<AboutStorySection | null>(null);
  const [communityData, setCommunityData] = useState<AboutCommunitySection | null>(null);
  const [loading, setLoading] = useState(true);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Fetch all sections together
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetchAboutHeroSection(),
      fetchAboutStorySection(),
      fetchAboutCommunitySection(),
    ])
      .then(([hero, story, community]) => {
        if (!cancelled) {
          setHeroData(hero);
          setStoryData(story);
          setCommunityData(community);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHeroData(null);
          setStoryData(null);
          setCommunityData(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const scrollTimeline = (direction: 1 | -1) => {
    const el = timelineRef.current;
    if (!el) return;
    const [first, second] = Array.from(el.children) as HTMLElement[];
    const step = first && second ? second.offsetLeft - first.offsetLeft : 388;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const drag = useRef({
    down: false,
    startX: 0,
    startScroll: 0,
    lastX: 0,
    velocity: 0,
    moved: false,
  });
  const momentum = useRef(0);

  const stopMomentum = () => cancelAnimationFrame(momentum.current);

  const settleToNearest = () => {
    const el = timelineRef.current;
    if (!el || !el.children.length) return;
    const cards = Array.from(el.children) as HTMLElement[];
    const nearest = cards.reduce((best, card) =>
      Math.abs(card.offsetLeft - el.scrollLeft) <
      Math.abs(best.offsetLeft - el.scrollLeft)
        ? card
        : best,
    );
    el.scrollTo({ left: nearest.offsetLeft, behavior: "smooth" });
  };

  const startMomentum = () => {
    let velocity = drag.current.velocity;
    const step = () => {
      const el = timelineRef.current;
      if (!el) return;
      velocity *= 0.94;
      if (Math.abs(velocity) < 0.3) {
        settleToNearest();
        return;
      }
      const before = el.scrollLeft;
      el.scrollLeft = before + velocity;
      if (el.scrollLeft === before) {
        settleToNearest();
        return;
      }
      momentum.current = requestAnimationFrame(step);
    };
    momentum.current = requestAnimationFrame(step);
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = timelineRef.current;
    if (!el) return;
    stopMomentum();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      down: true,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      lastX: e.clientX,
      velocity: 0,
      moved: false,
    };
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = timelineRef.current;
    if (!el || !drag.current.down) return;
    const dx = e.clientX - drag.current.lastX;
    drag.current.lastX = e.clientX;
    drag.current.velocity = 0.8 * drag.current.velocity + 0.2 * dx;
    if (Math.abs(e.clientX - drag.current.startX) > 8)
      drag.current.moved = true;
    el.scrollLeft =
      drag.current.startScroll - (e.clientX - drag.current.startX);
  };

  const endDrag = () => {
    if (!drag.current.down) return;
    drag.current.down = false;
    if (drag.current.moved) startMomentum();
    else settleToNearest();
  };

  if (loading || !heroData || !storyData || !communityData) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-16 px-4 py-10 md:px-6">
        {/* Hero skeleton */}
        <section className="relative overflow-hidden rounded-3xl">
          <Skeleton className="h-64 w-full sm:h-80" />
        </section>

        {/* Stats skeleton */}
        <section className="border-y">
          <dl className="grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="mx-auto h-8 w-20 mb-2" />
                <Skeleton className="mx-auto h-4 w-32" />
              </div>
            ))}
          </dl>
        </section>

        {/* Story skeleton */}
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
            </div>
            <div>
              <div className="mb-4 flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <div className="flex gap-1.5">
                  <Skeleton className="size-8" />
                  <Skeleton className="size-8" />
                </div>
              </div>
              <div className="flex gap-5 overflow-hidden">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 w-80 shrink-0 rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
          <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
        </section>

        {/* Values skeleton */}
        <section>
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <Skeleton className="mx-auto h-4 w-32 mb-2" />
            <Skeleton className="mx-auto h-10 w-64" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="gap-3 rounded-2xl py-5">
                <CardContent className="px-5">
                  <Skeleton className="size-11 rounded-xl mb-3" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Community skeleton */}
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <Skeleton className="aspect-[4/3] w-full rounded-3xl order-2 lg:order-1" />
          <div className="order-1 space-y-5 lg:order-2">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
            </div>
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          </div>
        </section>

        {/* Team skeleton */}
        <section>
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <Skeleton className="mx-auto h-4 w-20 mb-2" />
            <Skeleton className="mx-auto h-10 w-64 mb-2" />
            <Skeleton className="mx-auto h-4 w-96" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="items-center gap-3 rounded-2xl py-6 text-center">
                <Skeleton className="size-16 rounded-full mx-auto mb-2" />
                <Skeleton className="h-5 w-24 mx-auto mb-1" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </Card>
            ))}
          </div>
        </section>

        {/* CTA skeleton */}
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-16 px-4 py-10 md:px-6">
      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-3xl">
        <img
          src={heroData.image_url}
          alt={`About ${futsal?.name || "our futsal"}`}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="from-primary/90 via-primary/70 to-primary/30 absolute inset-0 bg-linear-to-r" />
        <div className="text-primary-foreground relative max-w-2xl space-y-3 px-6 py-12 sm:px-10 sm:py-16">
          <p className="text-xs font-semibold tracking-wide uppercase">
            About us
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {heroData.title}
          </h1>
          <p className="text-sm text-balance opacity-90 sm:text-base">
            {heroData.description}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y">
        <dl className="grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
          <div className="text-center">
            <dd className="text-primary text-2xl font-bold tracking-tight">
              {heroData.years_in_game}
            </dd>
            <dt className="text-muted-foreground mt-1 text-xs">
              Years in the game
            </dt>
          </div>
          <div className="text-center">
            <dd className="text-primary text-2xl font-bold tracking-tight">
              {heroData.matches_hosted}
            </dd>
            <dt className="text-muted-foreground mt-1 text-xs">
              Matches hosted
            </dt>
          </div>
          <div className="text-center">
            <dd className="text-primary text-2xl font-bold tracking-tight">
              {heroData.tournaments_run}
            </dd>
            <dt className="text-muted-foreground mt-1 text-xs">
              Tournaments run
            </dt>
          </div>
          <div className="text-center">
            <dd className="text-primary text-2xl font-bold tracking-tight">
              {heroData.players_in_community}
            </dd>
            <dt className="text-muted-foreground mt-1 text-xs">
              Players in the community
            </dt>
          </div>
        </dl>
      </section>

      {/* Our story */}
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="max-w-2xl space-y-3">
            <p className="text-primary text-sm font-semibold tracking-wide uppercase">
              Our story
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-balance">
              {storyData.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {storyData.description}
            </p>
          </div>

          <div>
            {/* Header + arrow controls */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">The journey so far</h3>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  aria-label="Scroll timeline back"
                  onClick={() => scrollTimeline(-1)}
                >
                  <ChevronLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  aria-label="Scroll timeline forward"
                  onClick={() => scrollTimeline(1)}
                >
                  <ChevronRightIcon />
                </Button>
              </div>
            </div>

            {/* Draggable scroller */}
            <div
              ref={timelineRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onPointerLeave={endDrag}
              onPointerCancel={endDrag}
              onDragStart={(e) => e.preventDefault()}
              className="flex cursor-grab gap-5 overflow-x-auto pb-2 select-none active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {storyData.journey.map((milestone, index) => (
                <article
                  key={milestone.year}
                  className="w-[300px] shrink-0 rounded-2xl border bg-card p-4 shadow-sm sm:w-[360px]"
                >
                  <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <img
                      src={milestone.image}
                      alt={milestone.title}
                      loading="lazy"
                      draggable={false}
                      className={`h-44 w-full shrink-0 rounded-xl object-cover sm:h-36 sm:w-32 ${
                        index % 2 === 1 ? "sm:order-2" : ""
                      }`}
                    />
                    <div className={index % 2 === 1 ? "sm:order-1" : ""}>
                      <p className="text-primary text-xs font-bold tracking-wide">
                        {milestone.year}
                      </p>
                      <h4 className="mt-1 text-sm font-semibold">
                        {milestone.title}
                      </h4>
                      <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <p className="mt-2 text-xs text-muted-foreground/60">
              Drag the cards or use the arrows — the story continues →
            </p>
          </div>
        </div>

        {/* Story image on the right */}
        <div className="relative">
          <img
            src={storyData.image_url}
            alt={`Team at ${futsal?.name || "our futsal"}`}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-3xl border object-cover shadow-lg"
          />
        </div>
      </section>

      {/* Values */}
      <section>
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">
            What we stand for
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            Four rules we play by
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {communityData.rules.map((value) => {
            const IconComponent = iconMap[value.iconcode] || SparklesIcon;
            
            return (
              <Card
                key={value.title}
                className="gap-3 rounded-2xl py-5 transition-shadow hover:shadow-md"
              >
                <CardContent className="px-5">
                  <div className="bg-primary/10 text-primary mb-3 flex size-11 items-center justify-center rounded-xl">
                    <IconComponent className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold">{value.title}</h3>
                  <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Community & coaching */}
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div className="relative order-2 lg:order-1">
          <img
            src={communityData.image_url}
            alt={`Community at ${futsal?.name || "our futsal"}`}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-3xl border object-cover shadow-lg"
          />
        </div>
        <div className="order-1 space-y-5 lg:order-2">
          <div className="space-y-3">
            <p className="text-primary text-sm font-semibold tracking-wide uppercase">
              Community
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-balance">
              {communityData.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {communityData.description}
            </p>
          </div>
          <ul className="space-y-2.5">
            {communityData.features.map((point) => (
              <li
                key={point}
                className="text-muted-foreground flex items-start gap-2.5 text-sm"
              >
                <UsersIcon
                  className="text-primary mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Team */}
      <section>
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">
            The team
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            The people behind the turf
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Say hi when you see us at the counter — we're usually around.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {communityData.team.map((member) => (
            <Card
              key={member.name}
              className="items-center gap-3 rounded-2xl py-6 text-center"
            >
              <Avatar className="size-16">
                {member.image && (
                  <AvatarImage src={member.image} alt={member.name} />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-sm font-semibold">{member.name}</h3>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {member.role}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-linear-to-br from-primary via-primary to-primary/80 text-primary-foreground relative overflow-hidden rounded-3xl px-6 py-12 text-center shadow-lg shadow-primary/20 sm:px-12">
        <div className="relative mx-auto max-w-2xl space-y-5">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Come see the turf for yourself
          </h2>
          <p className="mx-auto max-w-xl text-sm text-balance opacity-90 sm:text-base">
            Words only get you so far — book a slot, bring your squad and find
            out why players keep coming back to Balaju Height.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/bookings">Book a Slot</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

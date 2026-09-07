import { useRef, type PointerEvent } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartHandshakeIcon,
  SparklesIcon,
  TrophyIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { getInitials } from "@/lib/format";

const stats = [
  { value: "8+", label: "Years in the game" },
  { value: "20K+", label: "Matches hosted" },
  { value: "150+", label: "Tournaments run" },
  { value: "12K+", label: "Players in the community" },
];

const milestones = [
  {
    year: "2018",
    title: "One court, one dream",
    description:
      "Nexus Futsal opens in Balaju Height with a single court and a borrowed mower.",
    image: "/images/venue-indoor.jpg",
  },
  {
    year: "2021",
    title: "The second court",
    description:
      "We double down — a second floodlit court, locker rooms and hot showers.",
    image: "/images/venue-outdoor.jpg",
  },
  {
    year: "2024",
    title: "Leagues & coaching",
    description:
      "Regular tournaments, kids coaching and corporate nights become part of the week.",
    image: "/images/coaching.jpg",
  },
  {
    year: "2026",
    title: "Book online, play more",
    description:
      "Real-time online booking launches — your slot is confirmed in seconds.",
    image: "/images/hero.jpg",
  },
];

const values = [
  {
    icon: HeartHandshakeIcon,
    title: "Community first",
    description:
      "We're run by players, for players — regulars, rookies and everyone between.",
  },
  {
    icon: SparklesIcon,
    title: "Facilities without compromise",
    description:
      "FIFA-quality turf, clean showers, honest gear. The arena is match-ready, always.",
  },
  {
    icon: TrophyIcon,
    title: "Fair play, seriously",
    description:
      "Transparent slots, transparent prices, free rescheduling. No games off the pitch.",
  },
  {
    icon: WalletIcon,
    title: "Priced for everyone",
    description:
      "Morning rates that students can split, prime hours worth every rupee.",
  },
];

const communityPoints = [
  "Weekly leagues for every level — from beginners to the A-division crowd",
  "Kids coaching on weekend mornings with qualified trainers",
  "Corporate tournaments and team-building nights",
  "Open scrimmage nights where solo players find a squad",
];

const team = [
  { name: "Saroj Ghimire", role: "Founder & Owner" },
  { name: "Anisha Karki", role: "Arena Manager" },
  { name: "Bikash Shrestha", role: "Head Coach" },
  { name: "Rita Tamang", role: "Operations" },
];

export function AboutPage() {
  useDocumentTitle("About Us");
  const timelineRef = useRef<HTMLDivElement>(null);

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

  /** Ease the strip to the nearest card after momentum dies out. */
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

  /** Keep scrolling with decaying velocity — the "fling" inertia. */
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
        settleToNearest(); // hit the start/end edge
        return;
      }
      momentum.current = requestAnimationFrame(step);
    };
    momentum.current = requestAnimationFrame(step);
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return; // touch devices keep native scrolling
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
    drag.current.velocity = 0.8 * drag.current.velocity + 0.2 * dx; // smoothed
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

  return (
    <div className="mx-auto w-full max-w-7xl space-y-16 px-4 py-10 md:px-6">
      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-3xl">
        <img
          src="/images/action-2.jpg"
          alt="Players celebrating together at Nexus Futsal"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="from-primary/90 via-primary/70 to-primary/30 absolute inset-0 bg-linear-to-r" />
        <div className="text-primary-foreground relative max-w-2xl space-y-3 px-6 py-12 sm:px-10 sm:py-16">
          <p className="text-xs font-semibold tracking-wide uppercase">
            About us
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            More than a court.{" "}
            <span className="text-white/70">A community.</span>
          </h1>
          <p className="text-sm text-balance opacity-90 sm:text-base">
            Since 2018, Nexus Futsal has been Kathmandu's home of futsal — two
            meticulously kept courts, floodlights that never quit, and a
            community that shows up every single week.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y">
        <dl className="grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <dd className="text-primary text-2xl font-bold tracking-tight">
                {stat.value}
              </dd>
              <dt className="text-muted-foreground mt-1 text-xs">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </section>

      {/* Our story — dark scrollable timeline */}
      <section className="space-y-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">
            Our story
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-balance">
            Built by players, for players
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            It started with one court, one dream and a lot of late evenings
            rolling turf. Eight years later we host everything from 6 AM
            kickabouts to cup finals under the floodlights — scroll through the
            moments that got us here.
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
            {milestones.map((milestone, index) => (
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
          {values.map((value) => (
            <Card
              key={value.title}
              className="gap-3 rounded-2xl py-5 transition-shadow hover:shadow-md"
            >
              <CardContent className="px-5">
                <div className="bg-primary/10 text-primary mb-3 flex size-11 items-center justify-center rounded-xl">
                  <value.icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold">{value.title}</h3>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Community & coaching */}
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div className="relative order-2 lg:order-1">
          <img
            src="/images/coaching.jpg"
            alt="Coaching session with young players at Nexus Futsal"
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
              The arena fills up long before kickoff
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Futsal is a team game on and off the pitch. Our weeks are packed
              with leagues, coaching and nights where strangers leave as
              teammates.
            </p>
          </div>
          <ul className="space-y-2.5">
            {communityPoints.map((point) => (
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
          {team.map((member) => (
            <Card
              key={member.name}
              className="items-center gap-3 rounded-2xl py-6 text-center"
            >
              <Avatar className="size-16">
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

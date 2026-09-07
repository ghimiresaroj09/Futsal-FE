import { ArrowRightIcon, MessageCircleIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-20 md:px-6">
      <div className="bg-linear-to-br from-primary via-primary to-primary/80 text-primary-foreground relative overflow-hidden rounded-3xl px-6 py-14 text-center shadow-lg shadow-primary/20 sm:px-12">
        {/* subtle texture */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative mx-auto max-w-2xl space-y-5">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Gather your squad. We'll keep the lights on.
          </h2>
          <p className="mx-auto max-w-xl text-sm text-balance opacity-90 sm:text-base">
            Book your slot online in under a minute — or drop by the arena and
            see the turf for yourself.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/bookings">
                Book a Slot
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/contact">
                <MessageCircleIcon aria-hidden="true" />
                Talk to Us
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

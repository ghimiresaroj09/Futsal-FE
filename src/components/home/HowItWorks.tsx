import { CalendarCheck2Icon, ClockIcon, FootprintsIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: ClockIcon,
    title: "Check live slots",
    description:
      "Open the booking calendar and see exactly which hours are free on each court.",
  },
  {
    icon: CalendarCheck2Icon,
    title: "Reserve your court",
    description:
      "Pick your court, date and time — your slot is confirmed instantly.",
  },
  {
    icon: FootprintsIcon,
    title: "Show up & play",
    description:
      "Settle up at the counter when you arrive and hit the turf. It's that simple.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">
            How it works
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            On the pitch in three steps
          </h2>
        </div>

        <ol className="relative grid gap-10 md:grid-cols-3">
          {/* connector line (desktop) */}
          <div
            aria-hidden="true"
            className="border-primary/30 absolute top-7 right-[16%] left-[16%] hidden border-t-2 border-dotted md:block"
          />
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="relative flex flex-col items-center gap-4 text-center"
            >
              <div className="border-primary/30 bg-background relative z-10 flex size-14 items-center justify-center rounded-2xl border-2 shadow-sm">
                <step.icon className="text-primary size-6" aria-hidden="true" />
                <span className="bg-primary text-primary-foreground absolute -top-2.5 -right-2.5 flex size-6 items-center justify-center rounded-full text-xs font-bold">
                  {index + 1}
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

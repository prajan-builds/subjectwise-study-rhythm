import { Link, useLocation } from "@tanstack/react-router";
import { BarChart3, BookOpen, CalendarClock, CalendarDays, CheckSquare, Home, Menu, RotateCcw, Settings, Timer } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/syllabus", label: "Syllabus", icon: BookOpen },
  { to: "/planner", label: "Deadlines", icon: CalendarClock },
  { to: "/timetable", label: "Timetable", icon: CalendarDays },
  { to: "/focus", label: "Focus", icon: Timer },
  { to: "/revision", label: "Revision", icon: RotateCcw },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;
const MOBILE = ["/", "/tasks", "/syllabus", "/focus"];

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="min-h-dvh md:flex">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-card focus:px-3 focus:py-2">Skip to content</a>
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r bg-sidebar p-4 md:flex">
        <Link to="/" className="mb-6 flex items-center gap-2 px-2 text-lg font-bold">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-sm text-primary-foreground">S</span> StudyOS
        </Link>
        <nav aria-label="Main" className="grid gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent", isActive(to) && "bg-sidebar-accent font-semibold text-sidebar-accent-foreground")} aria-current={isActive(to) ? "page" : undefined}>
              <Icon className="size-4" /> {label}
            </Link>
          ))}
        </nav>
        <p className="mt-auto px-2 text-xs text-muted-foreground">Saved on this device</p>
      </aside>

      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-5 md:px-8 md:pb-10 md:pt-8">{children}</main>

      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {NAV.filter((n) => MOBILE.includes(n.to)).map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className={cn("flex flex-col items-center gap-0.5 py-2.5 text-[11px] text-muted-foreground", isActive(to) && "font-semibold text-primary")} aria-current={isActive(to) ? "page" : undefined}>
            <Icon className="size-5" /> {label === "Dashboard" ? "Home" : label}
          </Link>
        ))}
        <button onClick={() => setOpen(true)} className={cn("flex flex-col items-center gap-0.5 py-2.5 text-[11px] text-muted-foreground", !NAV.some((n) => MOBILE.includes(n.to) && isActive(n.to)) && "font-semibold text-primary")}>
          <Menu className="size-5" /> More
        </button>
      </nav>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader><SheetTitle>All sections</SheetTitle></SheetHeader>
          <div className="grid grid-cols-3 gap-2 p-4 pt-0">
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setOpen(false)} className={cn("flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs", isActive(to) && "border-primary bg-accent font-semibold")}>
                <Icon className="size-5" /> {label}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

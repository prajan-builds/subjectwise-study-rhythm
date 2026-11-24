import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CalendarPlus, CheckCircle2, Plus, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bar, SubjectDot } from "@/components/app/common";
import { EventDialog, EVENT_TYPES } from "@/components/app/EventDialog";
import { TaskDialog } from "@/components/app/TaskDialog";
import { TaskRow } from "@/components/app/TaskRow";
import { addDays, DAY_NAMES, diffDays, fmtDay, fmtMinutes, nowHM, relDay, todayKey, weekday, weekStart } from "@/lib/dates";
import { pageHead } from "@/lib/meta";
import { progressPct, subjectColor, subjectName, useData } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => pageHead("Dashboard", "Today's study plan, tasks, deadlines and progress at a glance."),
  component: Dashboard,
});

function greeting(hm: string) {
  const h = Number(hm.slice(0, 2));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function Card({ title, action, children, className }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("surface p-4", className)}>
      <div className="mb-3 flex items-center justify-between gap-2"><h2 className="font-semibold">{title}</h2>{action}</div>
      {children}
    </section>
  );
}

function Dashboard() {
  const d = useData();
  const t = todayKey();
  const plan = d.blocks.filter((b) => b.day === weekday(t)).sort((a, b) => a.start.localeCompare(b.start));
  const dueToday = d.tasks.filter((x) => !x.completed && x.due && x.due <= t).sort((a, b) => (a.due! < b.due! ? -1 : 1));
  const upcoming = d.events.filter((e) => !e.done && e.date >= t).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const overall = progressPct(d.chapters);
  const ws = weekStart(t);
  const week = Array.from({ length: 7 }, (_, i) => {
    const k = addDays(ws, i);
    return { k, min: d.sessions.filter((s) => s.date === k).reduce((a, s) => a + s.minutes, 0) };
  });
  const weekTotal = week.reduce((a, w) => a + w.min, 0);
  const maxMin = Math.max(30, ...week.map((w) => w.min));
  const revDue = d.chapters.filter((c) => c.forRevision && c.nextRevision && c.nextRevision <= t).length;
  const name = d.settings.name.trim();
  const hm = nowHM();

  return (
    <div className="grid gap-4">
      <header>
        <p className="text-sm text-muted-foreground">{fmtDay(t, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        <h1 className="page-title">{greeting(hm)}{name ? `, ${name}` : ""}</h1>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <TaskDialog trigger={<Button size="sm"><Plus /> Task</Button>} />
        <EventDialog trigger={<Button size="sm" variant="secondary"><CalendarPlus /> Deadline</Button>} />
        <Button size="sm" variant="secondary" asChild><Link to="/focus"><Timer /> Start focus</Link></Button>
        <Button size="sm" variant="secondary" asChild><Link to="/syllabus"><BookOpen /> Add chapter</Link></Button>
      </div>

      {revDue > 0 && (
        <Link to="/revision" className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
          <strong>{revDue}</strong> chapter{revDue > 1 ? "s" : ""} due for revision →
        </Link>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Today's plan" action={<Link to="/timetable" className="text-xs text-primary">Timetable</Link>}>
          {plan.length ? (
            <ul className="grid gap-2">
              {plan.map((b) => {
                const now = hm >= b.start && hm < b.end;
                return (
                  <li key={b.id} className={cn("flex items-center gap-3 rounded-lg border px-3 py-2 text-sm", now && "border-primary bg-accent")}>
                    <span className="w-24 shrink-0 tabular-nums text-muted-foreground">{b.start}–{b.end}</span>
                    <SubjectDot color={subjectColor(d, b.subjectId)} />
                    <span className="truncate">{b.title}</span>
                    {now && <span className="ml-auto text-xs font-medium text-primary">Now</span>}
                  </li>
                );
              })}
            </ul>
          ) : <p className="text-sm text-muted-foreground">Nothing scheduled for {DAY_NAMES[weekday(t)]}. <Link to="/timetable" className="text-primary underline-offset-2 hover:underline">Add study blocks</Link>.</p>}
        </Card>

        <Card title="Due today" action={<Link to="/tasks" className="text-xs text-primary">All tasks</Link>}>
          {dueToday.length ? <ul className="-mx-2">{dueToday.slice(0, 6).map((x) => <TaskRow key={x.id} task={x} compact />)}</ul>
            : <p className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="size-4 text-success" /> No tasks due today.</p>}
        </Card>

        <Card title="Upcoming deadlines" action={<Link to="/planner" className="text-xs text-primary">Planner</Link>}>
          {upcoming.length ? (
            <ul className="grid gap-2">
              {upcoming.map((e) => {
                const days = diffDays(e.date, t);
                return (
                  <li key={e.id} className="flex items-center gap-3 text-sm">
                    <span className={cn("grid w-12 shrink-0 place-items-center rounded-lg bg-muted py-1 text-center text-xs leading-tight", days <= 2 && "bg-warning/15")}>
                      <strong className="text-base">{days}</strong>{days === 1 ? "day" : "days"}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{e.title}</p>
                      <p className="text-xs text-muted-foreground">{EVENT_TYPES[e.type]}{subjectName(d, e.subjectId) ? ` · ${subjectName(d, e.subjectId)}` : ""} · {relDay(e.date)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : <p className="text-sm text-muted-foreground">No upcoming deadlines added.</p>}
        </Card>

        <Card title="This week" action={<span className="text-sm font-semibold">{fmtMinutes(weekTotal)}</span>}>
          <div className="flex h-28 items-end gap-2" aria-label="Study minutes per day this week">
            {week.map((w) => (
              <div key={w.k} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-1 items-end"><div className={cn("w-full rounded-md bg-primary/70", w.k === t && "bg-primary")} style={{ height: `${Math.max(3, (w.min / maxMin) * 100)}%` }} title={fmtMinutes(w.min)} /></div>
                <span className={cn("text-[11px] text-muted-foreground", w.k === t && "font-semibold text-foreground")}>{DAY_NAMES[weekday(w.k)]![0]}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Syllabus" action={<Link to="/syllabus" className="text-xs text-primary">Open tracker</Link>}>
        <div className="mb-4 flex items-center gap-3"><Bar value={overall} /><span className="w-12 text-right text-sm font-semibold">{overall}%</span></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {d.subjects.map((s) => {
            const ch = d.chapters.filter((c) => c.subjectId === s.id);
            const pct = progressPct(ch);
            return (
              <Link key={s.id} to="/syllabus" search={{ s: s.id }} className="rounded-lg border p-3 hover:bg-muted/50">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium"><SubjectDot color={s.color} />{s.name}<span className="ml-auto text-muted-foreground">{pct}%</span></div>
                <Bar value={pct} className="h-1.5" />
                <p className="mt-1.5 text-xs text-muted-foreground">{ch.length ? `${ch.filter((c) => c.status === "completed").length}/${ch.length} chapters done` : "No chapters yet"}</p>
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { todayKey } from "@/lib/dates";
import { actions, type EventType, type PlannerEvent, type Repeat } from "@/lib/store";
import { SubjectSelect } from "./common";

export const EVENT_TYPES: Record<EventType, string> = {
  assignment: "Assignment", practical: "Practical", test: "Test", project: "Project", board_exam: "Board exam", other: "Other",
};
export const REMINDER_OPTIONS = [
  { m: 15, label: "15 min before" }, { m: 60, label: "1 hour before" }, { m: 1440, label: "1 day before" },
  { m: 4320, label: "3 days before" }, { m: 10080, label: "1 week before" },
];

export function EventDialog({ event, trigger, defaultDate }: { event?: PlannerEvent; trigger: ReactNode; defaultDate?: string }) {
  const [open, setOpen] = useState(false);
  const init = () => ({
    title: event?.title ?? "", type: event?.type ?? ("assignment" as EventType), subjectId: event?.subjectId,
    date: event?.date ?? defaultDate ?? todayKey(), time: event?.time ?? "", reminders: event?.reminders ?? [1440],
    repeat: event?.repeat ?? ("none" as Repeat), notes: event?.notes ?? "",
  });
  const [f, setF] = useState(init);
  const [err, setErr] = useState("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (open) { setF(init()); setErr(""); } }, [open]);

  function save() {
    if (!f.title.trim()) return setErr("Please add a title.");
    if (!f.date) return setErr("Please choose a date.");
    actions.saveEvent({ ...(event ? { id: event.id } : {}), ...f, title: f.title.trim(), time: f.time || undefined, notes: f.notes.trim() || undefined });
    toast.success(event ? "Deadline updated" : "Deadline added");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader><DialogTitle>{event ? "Edit deadline" : "New deadline or exam"}</DialogTitle></DialogHeader>
        <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); save(); }}>
          <div className="grid gap-1.5"><Label htmlFor="e-title">Title</Label><Input id="e-title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Chemistry record submission" autoFocus /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Type</Label>
              <Select value={f.type} onValueChange={(v) => setF({ ...f, type: v as EventType })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(EVENT_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label>Subject</Label><SubjectSelect value={f.subjectId} onChange={(v) => setF({ ...f, subjectId: v })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label htmlFor="e-date">Date</Label><Input id="e-date" type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label htmlFor="e-time">Time (optional)</Label><Input id="e-time" type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></div>
          </div>
          <fieldset className="grid gap-2">
            <legend className="mb-1 text-sm font-medium">Remind me</legend>
            <div className="grid grid-cols-2 gap-2">
              {REMINDER_OPTIONS.map((o) => (
                <label key={o.m} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={f.reminders.includes(o.m)} onCheckedChange={(c) => setF({ ...f, reminders: c ? [...f.reminders, o.m] : f.reminders.filter((x) => x !== o.m) })} />
                  {o.label}
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Without a time, reminders count back from 11:59 PM on that day.</p>
          </fieldset>
          <div className="grid gap-1.5">
            <Label>Repeat</Label>
            <Select value={f.repeat} onValueChange={(v) => setF({ ...f, repeat: v as Repeat })}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="none">Doesn't repeat</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5"><Label htmlFor="e-notes">Notes</Label><Textarea id="e-notes" rows={2} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
          {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
          <DialogFooter><Button type="submit">{event ? "Save changes" : "Add"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

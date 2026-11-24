import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { todayKey } from "@/lib/dates";
import { actions, type Priority, type Repeat, type Task } from "@/lib/store";
import { SubjectSelect } from "./common";

type Form = { title: string; subjectId?: string | undefined; due: string; dueTime: string; priority: Priority; estMin: string; notes: string; repeat: Repeat };

function initial(task?: Task): Form {
  return {
    title: task?.title ?? "", subjectId: task?.subjectId, due: task?.due ?? todayKey(), dueTime: task?.dueTime ?? "",
    priority: task?.priority ?? "medium", estMin: task?.estMin ? String(task.estMin) : "", notes: task?.notes ?? "", repeat: task?.repeat ?? "none",
  };
}

export function TaskDialog({ task, trigger, open: openProp, onOpenChange }: { task?: Task; trigger?: ReactNode; open?: boolean; onOpenChange?: (o: boolean) => void }) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;
  const [f, setF] = useState<Form>(() => initial(task));
  const [err, setErr] = useState("");
  useEffect(() => { if (open) { setF(initial(task)); setErr(""); } }, [open, task]);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  function save() {
    if (!f.title.trim()) return setErr("Please give the task a title.");
    if (f.repeat !== "none" && !f.due) return setErr("Repeating tasks need a due date.");
    const est = f.estMin ? Number(f.estMin) : undefined;
    if (est !== undefined && (!Number.isFinite(est) || est <= 0 || est > 1440)) return setErr("Estimated duration should be between 1 and 1440 minutes.");
    actions.saveTask({
      ...(task ? { id: task.id, example: task.example } : {}),
      title: f.title.trim(), subjectId: f.subjectId, due: f.due || undefined, dueTime: f.dueTime || undefined,
      priority: f.priority, estMin: est, notes: f.notes.trim() || undefined, repeat: f.repeat,
    });
    toast.success(task ? "Task updated" : "Task added");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader><DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle></DialogHeader>
        <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); save(); }}>
          <div className="grid gap-1.5">
            <Label htmlFor="t-title">Title</Label>
            <Input id="t-title" value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Solve exercise 3.2" autoFocus />
          </div>
          <div className="grid gap-1.5"><Label htmlFor="t-sub">Subject</Label><SubjectSelect id="t-sub" value={f.subjectId} onChange={(v) => set("subjectId", v)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label htmlFor="t-due">Due date</Label><Input id="t-due" type="date" value={f.due} onChange={(e) => set("due", e.target.value)} /></div>
            <div className="grid gap-1.5"><Label htmlFor="t-time">Time (optional)</Label><Input id="t-time" type="time" value={f.dueTime} onChange={(e) => set("dueTime", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Priority</Label>
              <Select value={f.priority} onValueChange={(v) => set("priority", v as Priority)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label htmlFor="t-est">Est. minutes</Label><Input id="t-est" type="number" inputMode="numeric" min={1} value={f.estMin} onChange={(e) => set("estMin", e.target.value)} placeholder="30" /></div>
          </div>
          <div className="grid gap-1.5">
            <Label>Repeat</Label>
            <Select value={f.repeat} onValueChange={(v) => set("repeat", v as Repeat)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="none">Doesn't repeat</SelectItem><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5"><Label htmlFor="t-notes">Notes</Label><Textarea id="t-notes" rows={2} value={f.notes} onChange={(e) => set("notes", e.target.value)} /></div>
          {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
          <DialogFooter><Button type="submit">{task ? "Save changes" : "Add task"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

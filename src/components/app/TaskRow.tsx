import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { fmtMinutes, relDay, todayKey } from "@/lib/dates";
import { actions, subjectColor, subjectName, useData, type Task } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Confirm, SubjectDot } from "./common";
import { TaskDialog } from "./TaskDialog";

export function TaskRow({ task, compact }: { task: Task; compact?: boolean }) {
  const d = useData();
  const [edit, setEdit] = useState(false);
  const overdue = !task.completed && task.due && task.due < todayKey();
  const sub = subjectName(d, task.subjectId);
  return (
    <li className="flex items-start gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/60">
      <Checkbox className="mt-0.5 size-5" checked={task.completed} onCheckedChange={() => actions.toggleTask(task.id)} aria-label={`Mark "${task.title}" ${task.completed ? "not done" : "done"}`} />
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-medium", task.completed && "text-muted-foreground line-through")}>{task.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {sub && <span className="flex items-center gap-1.5"><SubjectDot color={subjectColor(d, task.subjectId)} />{sub}</span>}
          {task.due && <span className={cn(overdue && "font-medium text-destructive")}>{overdue ? "Overdue · " : ""}{relDay(task.due)}{task.dueTime ? ` ${task.dueTime}` : ""}</span>}
          {task.estMin && <span>{fmtMinutes(task.estMin)}</span>}
          {task.priority === "high" && <Badge variant="outline" className="border-destructive/40 text-destructive">High</Badge>}
          {task.repeat !== "none" && <span>↻ {task.repeat}</span>}
          {task.example && <Badge variant="secondary">Example</Badge>}
        </div>
        {!compact && task.notes && <p className="mt-1 text-xs text-muted-foreground">{task.notes}</p>}
      </div>
      <div className="flex shrink-0">
        <Button variant="ghost" size="icon" className="size-8" aria-label="Edit task" onClick={() => setEdit(true)}><Pencil className="size-4" /></Button>
        <Confirm title="Delete this task?" description={task.title} onConfirm={() => actions.deleteTask(task.id)}
          trigger={<Button variant="ghost" size="icon" className="size-8" aria-label="Delete task"><Trash2 className="size-4" /></Button>} />
      </div>
      <TaskDialog task={task} open={edit} onOpenChange={setEdit} />
    </li>
  );
}

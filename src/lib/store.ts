import { useSyncExternalStore } from "react";
import { addDays, addMonths, todayKey } from "./dates";

// ---------- Types (kept plain/serialisable so a cloud sync layer can mirror them later) ----------
export type Priority = "low" | "medium" | "high";
export type Repeat = "none" | "daily" | "weekly" | "monthly";
export type ChapterStatus = "not_started" | "in_progress" | "completed";
export type EventType = "assignment" | "practical" | "test" | "project" | "board_exam" | "other";
export type BlockKind = "study" | "school" | "tuition" | "personal";

export interface Subject { id: string; name: string; color: number }
export interface Subtopic { id: string; title: string; done: boolean }
export interface Chapter {
  id: string; subjectId: string; title: string; status: ChapterStatus; order: number;
  confidence?: number | undefined; lastRevised?: string | undefined; forRevision?: boolean | undefined; nextRevision?: string | undefined;
  subtopics: Subtopic[];
}
export interface Task {
  id: string; title: string; subjectId?: string | undefined; due?: string | undefined; dueTime?: string | undefined;
  priority: Priority; estMin?: number | undefined; notes?: string | undefined; repeat: Repeat;
  completed: boolean; completedAt?: string | undefined; example?: boolean | undefined; createdAt: string;
}
export interface PlannerEvent {
  id: string; title: string; type: EventType; subjectId?: string | undefined; date: string; time?: string | undefined;
  reminders: number[]; // minutes before
  repeat: Repeat; notes?: string | undefined; done: boolean; fired: string[];
}
export interface Block { id: string; day: number; start: string; end: string; title: string; kind: BlockKind; subjectId?: string | undefined }
export interface Session { id: string; date: string; startedAt: string; minutes: number; subjectId?: string | undefined; taskId?: string | undefined }
export interface Settings {
  name: string; theme: "system" | "light" | "dark"; notifications: boolean;
  focusMin: number; breakMin: number; longBreakMin: number;
}
export interface AppData {
  version: 1;
  subjects: Subject[]; chapters: Chapter[]; tasks: Task[]; events: PlannerEvent[];
  blocks: Block[]; sessions: Session[]; progressHistory: { date: string; pct: number }[];
  settings: Settings;
}

const KEY = "studyos:v1";
let workspaceKey = KEY;
let onWorkspaceChange: (() => void) | null = null;

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function makeDefaultData(withExamples = true): AppData {
  const names = ["Tamil", "English", "Mathematics", "Physics", "Chemistry", "Computer Science"];
  const subjects = names.map((name, i) => ({ id: `s${i + 1}`, name, color: i }));
  const t = todayKey();
  return {
    version: 1,
    subjects,
    chapters: [],
    tasks: withExamples
      ? [
          { id: "ex1", title: "Example: plan this week's study goals", priority: "medium", repeat: "none", completed: false, due: t, estMin: 15, example: true, createdAt: new Date().toISOString(), notes: "This is a sample task — delete it anytime." },
          { id: "ex2", title: "Example: add your first Physics chapter", subjectId: "s4", priority: "low", repeat: "none", completed: false, due: addDays(t, 2), estMin: 10, example: true, createdAt: new Date().toISOString() },
        ]
      : [],
    events: [], blocks: [], sessions: [], progressHistory: [],
    settings: { name: "", theme: "system", notifications: false, focusMin: 25, breakMin: 5, longBreakMin: 15 },
  };
}

// ---------- Pure helpers (tested) ----------
export function nextDue(due: string, repeat: Repeat): string {
  if (repeat === "daily") return addDays(due, 1);
  if (repeat === "weekly") return addDays(due, 7);
  if (repeat === "monthly") return addMonths(due, 1);
  return due;
}
export function chapterScore(c: Chapter): number {
  if (c.status === "completed") return 1;
  if (c.subtopics.length) {
    const done = c.subtopics.filter((s) => s.done).length / c.subtopics.length;
    return c.status === "in_progress" ? Math.max(done, 0.5 * done + 0.25) : done;
  }
  return c.status === "in_progress" ? 0.5 : 0;
}
export function progressPct(chapters: Chapter[]): number {
  if (!chapters.length) return 0;
  return Math.round((chapters.reduce((a, c) => a + chapterScore(c), 0) / chapters.length) * 100);
}

// ---------- Store ----------
let state: AppData | null = null;
let serverState: AppData | null = null;
function getServerState() { serverState ??= makeDefaultData(false); return serverState; }
const listeners = new Set<() => void>();

export function configureWorkspace(userId: string | null, onChange: (() => void) | null) {
  workspaceKey = userId ? `studyos:user:${userId}` : KEY;
  onWorkspaceChange = onChange;
  state = null;
  listeners.forEach((listener) => listener());
}
export function replaceWorkspace(data: AppData) {
  state = data;
  persist();
  listeners.forEach((listener) => listener());
}

function load(): AppData {
  if (state) return state;
  try {
    const raw = localStorage.getItem(workspaceKey);
    state = raw ? migrate(JSON.parse(raw)) : makeDefaultData(workspaceKey === KEY);
  } catch {
    state = makeDefaultData(workspaceKey === KEY);
  }
  return state;
}
export function migrate(d: Partial<AppData>): AppData {
  const base = makeDefaultData(false);
  return { ...base, ...d, settings: { ...base.settings, ...(d.settings ?? {}) }, version: 1 } as AppData;
}
function persist() {
  try { localStorage.setItem(workspaceKey, JSON.stringify(state)); } catch { console.error("Device storage unavailable; export a backup before closing this tab."); }
}
export function getData(): AppData { return load(); }
export function setData(fn: (d: AppData) => AppData) {
  const next = fn(load());
  const pct = progressPct(next.chapters);
  const t = todayKey();
  const hist = next.progressHistory.filter((h) => h.date !== t);
  state = next.chapters.length ? { ...next, progressHistory: [...hist, { date: t, pct }].slice(-365) } : next;
  persist();
  listeners.forEach((l) => l());
  onWorkspaceChange?.();
}
function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => { if (e.key === workspaceKey) { state = null; l(); onWorkspaceChange?.(); } };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(l); window.removeEventListener("storage", onStorage); };
}
export function useData(): AppData {
  return useSyncExternalStore(subscribe, load, getServerState);
}

// ---------- Actions ----------
const upd = <T extends { id: string }>(arr: T[], id: string, patch: Partial<T>) => arr.map((x) => (x.id === id ? { ...x, ...patch } : x));

export const actions = {
  saveTask(t: Omit<Task, "id" | "createdAt" | "completed"> & { id?: string }) {
    setData((d) => t.id
      ? { ...d, tasks: upd(d.tasks, t.id, t as Partial<Task>) }
      : { ...d, tasks: [...d.tasks, { ...t, id: uid(), completed: false, createdAt: new Date().toISOString() }] });
  },
  toggleTask(id: string) {
    setData((d) => {
      const task = d.tasks.find((x) => x.id === id);
      if (!task) return d;
      let tasks = upd(d.tasks, id, { completed: !task.completed, completedAt: task.completed ? undefined : new Date().toISOString() });
      if (!task.completed && task.repeat !== "none" && task.due) {
        tasks = [...tasks, { ...task, id: uid(), completed: false, completedAt: undefined, due: nextDue(task.due, task.repeat), createdAt: new Date().toISOString() }];
      }
      return { ...d, tasks };
    });
  },
  deleteTask(id: string) { setData((d) => ({ ...d, tasks: d.tasks.filter((x) => x.id !== id) })); },

  saveSubject(s: { id?: string; name: string }) {
    setData((d) => s.id
      ? { ...d, subjects: upd(d.subjects, s.id, { name: s.name }) }
      : { ...d, subjects: [...d.subjects, { id: uid(), name: s.name, color: d.subjects.length % 8 }] });
  },
  deleteSubject(id: string) {
    setData((d) => ({
      ...d,
      subjects: d.subjects.filter((s) => s.id !== id),
      chapters: d.chapters.filter((c) => c.subjectId !== id),
      tasks: d.tasks.map((t) => (t.subjectId === id ? { ...t, subjectId: undefined } : t)),
      events: d.events.map((t) => (t.subjectId === id ? { ...t, subjectId: undefined } : t)),
      blocks: d.blocks.map((t) => (t.subjectId === id ? { ...t, subjectId: undefined } : t)),
    }));
  },

  addChapter(subjectId: string, title: string) {
    setData((d) => {
      const order = d.chapters.filter((c) => c.subjectId === subjectId).length;
      return { ...d, chapters: [...d.chapters, { id: uid(), subjectId, title, status: "not_started", order, subtopics: [] }] };
    });
  },
  updateChapter(id: string, patch: Partial<Chapter>) { setData((d) => ({ ...d, chapters: upd(d.chapters, id, patch) })); },
  deleteChapter(id: string) { setData((d) => ({ ...d, chapters: d.chapters.filter((c) => c.id !== id) })); },
  moveChapter(id: string, dir: -1 | 1) {
    setData((d) => {
      const c = d.chapters.find((x) => x.id === id);
      if (!c) return d;
      const list = d.chapters.filter((x) => x.subjectId === c.subjectId).sort((a, b) => a.order - b.order);
      const i = list.findIndex((x) => x.id === id);
      const j = i + dir;
      if (j < 0 || j >= list.length) return d;
      const first = list[i]; const second = list[j];
      if (!first || !second) return d;
      [list[i], list[j]] = [second, first];
      const orders = new Map(list.map((x, k) => [x.id, k]));
      return { ...d, chapters: d.chapters.map((x) => { const order = orders.get(x.id); return order === undefined ? x : { ...x, order }; }) };
    });
  },
  completeRevision(id: string, nextInDays?: number) {
    const t = todayKey();
    setData((d) => ({ ...d, chapters: upd(d.chapters, id, { lastRevised: t, nextRevision: nextInDays ? addDays(t, nextInDays) : undefined, forRevision: !!nextInDays }) }));
  },

  saveEvent(e: Omit<PlannerEvent, "id" | "done" | "fired"> & { id?: string }) {
    setData((d) => e.id
      ? { ...d, events: upd(d.events, e.id, { ...e, fired: [] } as Partial<PlannerEvent>) }
      : { ...d, events: [...d.events, { ...e, id: uid(), done: false, fired: [] }] });
  },
  toggleEvent(id: string) {
    setData((d) => {
      const ev = d.events.find((x) => x.id === id);
      if (!ev) return d;
      let events = upd(d.events, id, { done: !ev.done });
      if (!ev.done && ev.repeat !== "none") events = [...events, { ...ev, id: uid(), done: false, fired: [], date: nextDue(ev.date, ev.repeat) }];
      return { ...d, events };
    });
  },
  markFired(id: string, k: string) { setData((d) => ({ ...d, events: d.events.map((e) => (e.id === id ? { ...e, fired: [...e.fired, k] } : e)) })); },
  deleteEvent(id: string) { setData((d) => ({ ...d, events: d.events.filter((x) => x.id !== id) })); },

  saveBlock(b: Omit<Block, "id"> & { id?: string }) {
    setData((d) => b.id ? { ...d, blocks: upd(d.blocks, b.id, b as Partial<Block>) } : { ...d, blocks: [...d.blocks, { ...b, id: uid() }] });
  },
  deleteBlock(id: string) { setData((d) => ({ ...d, blocks: d.blocks.filter((x) => x.id !== id) })); },

  addSession(s: Omit<Session, "id">) { setData((d) => ({ ...d, sessions: [...d.sessions, { ...s, id: uid() }] })); },
  deleteSession(id: string) { setData((d) => ({ ...d, sessions: d.sessions.filter((x) => x.id !== id) })); },

  updateSettings(p: Partial<Settings>) { setData((d) => ({ ...d, settings: { ...d.settings, ...p } })); },
  importData(raw: unknown) {
    if (!raw || typeof raw !== "object" || !Array.isArray((raw as AppData).subjects)) throw new Error("This file doesn't look like a StudyOS backup.");
    setData(() => migrate(raw as AppData));
  },
  reset() { setData(() => makeDefaultData()); },
};

export function subjectName(d: AppData, id?: string) {
  return d.subjects.find((s) => s.id === id)?.name;
}
export function subjectColor(d: AppData, id?: string): number {
  return d.subjects.find((s) => s.id === id)?.color ?? -1;
}

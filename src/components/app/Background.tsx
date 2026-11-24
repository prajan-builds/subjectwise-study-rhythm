import { useEffect } from "react";
import { toast } from "sonner";
import { istInstant } from "@/lib/dates";
import { actions, getData, useData } from "@/lib/store";

/** Applies the theme and checks reminders while the app is open. */
export function Background() {
  const d = useData();
  const theme = d.settings.theme;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => document.documentElement.classList.toggle("dark", theme === "dark" || (theme === "system" && mq.matches));
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  useEffect(() => {
    const check = () => {
      const data = getData();
      const now = Date.now();
      for (const e of data.events) {
        if (e.done) continue;
        const at = istInstant(e.date, e.time);
        for (const m of e.reminders) {
          const key = `${e.date}:${m}`;
          const fireAt = at - m * 60000;
          // Fire if due and not more than a day stale (avoids a flood after long absence).
          if (now >= fireAt && now < at && now - fireAt < 86400000 && !e.fired.includes(key)) {
            actions.markFired(e.id, key);
            const msg = `${e.title} — due ${new Date(at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: e.time ? "short" : undefined })}`;
            toast.info("Reminder", { description: msg, duration: 10000 });
            if (data.settings.notifications && "Notification" in window && Notification.permission === "granted") {
              try { new Notification("StudyOS reminder", { body: msg }); } catch { /* some mobile browsers need a service worker */ }
            }
          }
        }
      }
    };
    check();
    const id = window.setInterval(check, 30000);
    return () => window.clearInterval(id);
  }, []);

  return null;
}

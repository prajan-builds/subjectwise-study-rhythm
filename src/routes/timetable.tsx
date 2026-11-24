import { createFileRoute } from "@tanstack/react-router";
import { Empty, PageHeader } from "@/components/app/common";
import { pageHead } from "@/lib/meta";

export const Route = createFileRoute("/timetable")({
  head: () => pageHead("Timetable", "Timetable in StudyOS."),
  validateSearch: (s: Record<string, unknown>): { s?: string | undefined } => ({ s: typeof s["s"] === "string" ? s["s"] : undefined }),
  component: Page,
});

function Page() {
  return (
    <div>
      <PageHeader title="Timetable" />
      <Empty title="This section is being built">It will be added in the next update.</Empty>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Empty, PageHeader } from "@/components/app/common";
import { pageHead } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => pageHead("Analytics", "Analytics in StudyOS."),
  validateSearch: (s: Record<string, unknown>): { s?: string | undefined } => ({ s: typeof s["s"] === "string" ? s["s"] : undefined }),
  component: Page,
});

function Page() {
  return (
    <div>
      <PageHeader title="Analytics" />
      <Empty title="This section is being built">It will be added in the next update.</Empty>
    </div>
  );
}

import type { IssueStatus } from "@newsletter/db/schema";
import { Badge } from "@newsletter/ui/components/ui/badge";

const MAP: Record<
  IssueStatus,
  { label: string; variant: "warning" | "success" | "destructive" | "secondary" }
> = {
  pending: { label: "Pending review", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  sent: { label: "Sent", variant: "secondary" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export function IssueStatusBadge({ status }: { status: IssueStatus }) {
  const conf = MAP[status] ?? MAP.pending;
  return <Badge variant={conf.variant}>{conf.label}</Badge>;
}

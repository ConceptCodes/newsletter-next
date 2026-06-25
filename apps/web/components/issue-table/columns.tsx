"use client";

import Link from "next/link";
import type { Issue } from "@newsletter/db/schema";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { Button } from "@newsletter/ui/components/ui/button";
import { IssueStatusBadge } from "@/components/issue-status-badge";

export const issueColumns: ColumnDef<Issue>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const title = row.getValue<string>("title") || "Untitled";
      return <span className="font-medium">{title}</span>;
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <IssueStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt") as string);
      return <span className="text-muted-foreground">{format(date, "yyyy-MM-dd")}</span>;
    },
  },
  {
    accessorKey: "published",
    header: "Sent",
    cell: ({ row }) => {
      const value = row.getValue("published") as string | null;
      if (!value) return <span className="text-muted-foreground">—</span>;
      return <span className="text-muted-foreground">{format(new Date(value), "yyyy-MM-dd")}</span>;
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button asChild variant="outline" size="sm">
        <Link href={`/issues/${row.original.id}`}>Edit</Link>
      </Button>
    ),
  },
];

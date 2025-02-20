"use client";

import type { Issue } from "@/server/db/schema";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export const issueColumns: ColumnDef<Issue>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date: Date = new Date(row.getValue("createdAt"));
      return format(date, "yyyy-MM-dd");
    },
  },
  {
    accessorKey: "published",
    header: "Published",
    cell: ({ row }) => {
      const date: Date = new Date(row.getValue("emailVerified"));
      return format(date, "yyyy-MM-dd");
    },
  },
  {
    accessorKey: "content",
    header: "Content",
    cell: ({ row }) => {
      const content: string = row.getValue("content");
      return <div className="max-h-20 overflow-hidden truncate">{content}</div>;
    },
  },
];

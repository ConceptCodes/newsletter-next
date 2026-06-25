"use client";

import type { User } from "@newsletter/db/schema";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span className="font-medium">{row.getValue("email")}</span>,
  },
  {
    accessorKey: "emailVerified",
    header: "Subscribed",
    cell: ({ row }) => {
      const value = row.getValue("emailVerified") as string | null;
      if (!value) return <span className="text-muted-foreground">—</span>;
      return <span className="text-muted-foreground">{format(new Date(value), "yyyy-MM-dd")}</span>;
    },
  },
];

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@newsletter/ui/components/ui/data-table";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@newsletter/ui/components/ui/table";
import { Skeleton } from "@newsletter/ui/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@newsletter/ui/components/ui/alert";
import { Terminal } from "lucide-react";

type QueryTableProps<TData> = {
  // Structural: accepts both raw react-query and tRPC query results.
  query: {
    data: TData[] | undefined;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
  };
  columns: ColumnDef<TData>[];
};

export const QueryTable = <TData,>({ query, columns }: QueryTableProps<TData>) => {
  const { data, isLoading, isError, error } = query;

  if (isLoading) {
    return (
      <Table>
        <TableCaption>Loading data</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">
              <Skeleton className="h-4 w-[100px]" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-[100px]" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-[100px]" />
            </TableHead>
            <TableHead className="text-right">
              <Skeleton className="h-4 w-[100px]" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">
              <Skeleton className="h-4 w-[100px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[100px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[100px]" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="h-4 w-[100px]" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "An error occurred"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data!} />
    </div>
  );
};

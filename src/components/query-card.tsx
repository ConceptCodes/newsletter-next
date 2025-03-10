import { type QueryObserverBaseResult } from "@tanstack/react-query";
import { type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

interface QueryCardProps {
  query: QueryObserverBaseResult<number>;
  title: string;
  icon: LucideIcon;
}

function QueryCard({ query, title, icon }: QueryCardProps) {
  const { data, isLoading } = query;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {isLoading ? (
          <Skeleton className="h-6 w-[50px] pb-4" />
        ) : (
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
        )}
        {React.createElement(
          icon,
          { className: "text-muted-foreground h-6 w-6 text-primary" },
          null,
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-6 w-[75px] pb-4" />
        ) : (
          <div className="text-2xl font-bold">{data ?? 0}</div>
        )}
      </CardContent>
    </Card>
  );
}

export default QueryCard;

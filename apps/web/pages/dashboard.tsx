import { useState } from "react";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";

import { CheckCircle2, NewspaperIcon, Sparkles, UserIcon } from "lucide-react";

import { Button } from "@newsletter/ui/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@newsletter/ui/components/ui/tabs";
import { useToast } from "@newsletter/ui/hooks/use-toast";
import QueryCard from "@/components/query-card";
import { QueryTable } from "@/components/query-table";
import { issueColumns } from "@/components/issue-table/columns";
import { userColumns } from "@/components/user-table/columns";

import { api } from "@/utils/api";
import type { Issue, User } from "@newsletter/db/schema";

type DashboardTab = "overview" | "user-management";

export default function DashboardPage() {
  const router = useRouter();
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>("overview");
  const { toast } = useToast();
  const utils = api.useContext();

  const totalUsers = api.user.total.useQuery();
  const totalIssues = api.issue.total.useQuery();
  const pendingIssues = api.issue.pending.useQuery();

  const allUsers = api.user.getAll.useQuery();
  const allIssues = api.issue.getAll.useQuery();

  const generateMutation = api.issue.generate.useMutation({
    onSuccess: (result) => {
      toast({
        title: "Issue drafted",
        description: `"${result.title ?? "Untitled"}" is ready for review.`,
      });
      utils.issue.getAll.invalidate();
      utils.issue.total.invalidate();
      utils.issue.pending.invalidate();
      void router.push(`/issues/${result.issueId}`);
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    await signOut({ redirectTo: "/" });
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="hidden flex-col md:flex">
        <div className="flex items-center justify-between p-4">
          <Button onClick={handleLogout} variant="ghost" size="sm">
            Logout
          </Button>
          <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
            <Sparkles className="mr-1 h-4 w-4" />
            {generateMutation.isPending ? "Drafting…" : "Generate issue"}
          </Button>
        </div>
        {generateMutation.isPending && (
          <div className="px-4 text-sm text-muted-foreground">
            The agent is researching, drafting, and revising. This can take a few minutes…
          </div>
        )}
        <div className="flex-1 space-y-4 p-8">
          <Tabs value={dashboardTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview" onClick={() => setDashboardTab("overview")}>
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="user-management"
                onClick={() => setDashboardTab("user-management")}
              >
                Subscribers
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <QueryCard query={totalUsers} title="Subscribers" icon={UserIcon} />
                <QueryCard query={totalIssues} title="Total issues" icon={NewspaperIcon} />
                <QueryCard query={pendingIssues} title="Pending review" icon={CheckCircle2} />
              </div>
              <QueryTable<Issue> query={allIssues} columns={issueColumns} />
            </TabsContent>
            <TabsContent value="user-management">
              <QueryTable<User> query={allUsers} columns={userColumns} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

import { issueColumns } from "@/components/issue-table/columns";
import QueryCard from "@/components/query-card";
import { QueryTable } from "@/components/query-table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userColumns } from "@/components/user-table/columns";
import { api } from "@/utils/api";
import { NewspaperIcon, UserIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

type DashboardTab = "overview" | "user-management";

export default function DashboardPage() {
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>("overview");

  const totalUsers = api.user.total.useQuery();
  const totalIssues = api.issue.total.useQuery();

  const allUsers = api.user.getAll.useQuery();
  const allIssues = api.issue.getAll.useQuery();

  const handleLogout = async () => {
    await signOut({
      redirectTo: "/",
    });
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="hidden flex-col md:flex">
        <Button className="mb-4" onClick={handleLogout}>
          Logout
        </Button>
        <div className="flex-1 space-y-4 p-8">
          <Tabs value={dashboardTab} className="space-y-4">
            <TabsList>
              <TabsTrigger
                value="overview"
                onClick={() => setDashboardTab("overview")}
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="user-management"
                onClick={() => setDashboardTab("user-management")}
              >
                Users
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <QueryCard
                  query={totalUsers}
                  title="Total Users"
                  icon={UserIcon}
                />
                <QueryCard
                  query={totalIssues}
                  title="Total Issues"
                  icon={NewspaperIcon}
                />
              </div>
              <QueryTable query={allIssues} columns={issueColumns} />
            </TabsContent>
            <TabsContent value="user-management">
              <QueryTable query={allUsers} columns={userColumns} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

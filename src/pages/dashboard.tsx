import QueryCard from "@/components/query-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/utils/api";
import { NewspaperIcon, UserIcon } from "lucide-react";
import { useState } from "react";

type DashboardTab = "overview" | "issues" | "user-management";

export const DashboardPage = () => {
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>("overview");

  const totalUsers = api.user.total.useQuery();
  const totalIssues = api.issue.getAll.useQuery();

  return (
    <div className="flex h-full w-full flex-col">
      <div className="hidden flex-col md:flex">
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
              <TabsTrigger
                value="issues"
                onClick={() => setDashboardTab("issues")}
              >
                Issues
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
            </TabsContent>
            <TabsContent value="user-management"></TabsContent>
            <TabsContent value="issues"></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

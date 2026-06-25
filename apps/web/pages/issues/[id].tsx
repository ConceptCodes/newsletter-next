import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowLeft, Check, Send, Trash2 } from "lucide-react";
import { marked } from "marked";

import { Button } from "@newsletter/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@newsletter/ui/components/ui/card";
import { Input } from "@newsletter/ui/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@newsletter/ui/components/ui/tabs";
import { Textarea } from "@newsletter/ui/components/ui/textarea";
import { useToast } from "@newsletter/ui/hooks/use-toast";

import { IssueStatusBadge } from "@/components/issue-status-badge";
import { api } from "@/utils/api";

export default function IssueEditorPage() {
  const router = useRouter();
  const id = Number(router.query.id);
  const enabled = !!router.query.id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loaded, setLoaded] = useState(false);
  const { toast } = useToast();
  const utils = api.useContext();

  const query = api.issue.getById.useQuery({ id }, { enabled });

  // Seed local edit state once the issue loads.
  useEffect(() => {
    if (query.data && !loaded) {
      setTitle(query.data.title ?? "");
      setContent(query.data.content);
      setLoaded(true);
    }
  }, [query.data, loaded]);

  const issue = query.data;
  const previewHtml = useMemo(() => marked.parse(content, { async: false }) as string, [content]);

  const updateMutation = api.issue.update.useMutation({
    onSuccess: () => {
      toast({ title: "Saved", description: "Your edits were saved." });
      utils.issue.getById.invalidate({ id });
      utils.issue.getAll.invalidate();
    },
  });
  const approveMutation = api.issue.approve.useMutation({
    onSuccess: () => {
      toast({
        title: "Approved",
        description: "This issue will be sent on the next send-cron tick.",
      });
      utils.issue.getById.invalidate({ id });
      utils.issue.getAll.invalidate();
    },
  });
  const rejectMutation = api.issue.reject.useMutation({
    onSuccess: () => {
      toast({ title: "Rejected", description: "The issue was discarded." });
      utils.issue.getById.invalidate({ id });
      utils.issue.getAll.invalidate();
    },
  });
  const sendMutation = api.issue.sendNow.useMutation({
    onSuccess: (res) => {
      toast({ title: "Sent", description: `Delivered to ${res.sent} subscriber(s).` });
      utils.issue.getById.invalidate({ id });
      utils.issue.getAll.invalidate();
    },
  });

  if (!enabled || query.isLoading) {
    return <div className="p-8 text-muted-foreground">Loading issue…</div>;
  }
  if (!issue) {
    return <div className="p-8 text-muted-foreground">Issue not found.</div>;
  }

  const canApprove = issue.status === "pending" || issue.status === "rejected";
  const dirty = title !== (issue.title ?? "") || content !== issue.content;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-4 border-b px-6 py-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="mr-1 h-4 w-4" /> Dashboard
          </Link>
        </Button>
        <h1 className="flex-1 truncate text-lg font-semibold">{title || "Untitled issue"}</h1>
        <IssueStatusBadge status={issue.status} />
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subject line</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Issue title"
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="edit">
          <TabsList>
            <TabsTrigger value="edit">Edit (Markdown)</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="edit">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Write the issue in Markdown…"
              className="min-h-[480px] font-mono text-sm"
            />
          </TabsContent>
          <TabsContent value="preview">
            <Card>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {issue.sources && issue.sources.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sources cited by the agent</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {issue.sources.map((s) => (
                  <li key={s.url}>
                    <a
                      className="text-primary underline"
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => updateMutation.mutate({ id, title, content })}
            disabled={updateMutation.isPending || !dirty}
          >
            Save changes
          </Button>

          <Button
            variant="secondary"
            onClick={() => approveMutation.mutate({ id })}
            disabled={approveMutation.isPending || !canApprove}
          >
            <Check className="mr-1 h-4 w-4" /> Approve
          </Button>

          <Button
            variant="outline"
            onClick={() => sendMutation.mutate({ id })}
            disabled={sendMutation.isPending || issue.status === "sent"}
            title="Send to every subscriber now"
          >
            <Send className="mr-1 h-4 w-4" /> Send now
          </Button>

          <Button
            variant="ghost"
            className="text-destructive"
            onClick={() => rejectMutation.mutate({ id })}
            disabled={rejectMutation.isPending || issue.status === "sent"}
          >
            <Trash2 className="mr-1 h-4 w-4" /> Reject
          </Button>

          <span className="ml-auto text-xs text-muted-foreground">
            {dirty ? "Unsaved changes" : "All changes saved"}
          </span>
        </div>
      </main>
    </div>
  );
}

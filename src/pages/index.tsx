import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, BookOpen, Sparkles, Clock } from "lucide-react";
import { env } from "@/env";
import { api } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { subscribeSchema, type SubscribeSchema } from "@/server/api/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

export default function NewsletterLanding() {
  const { data: total, isLoading } = api.user.total.useQuery();
  const { toast } = useToast();

  const form = useForm<SubscribeSchema>({
    resolver: zodResolver(subscribeSchema),
  });

  const subscribeMutation = api.user.subscribe.useMutation({
    onSuccess: () => {
      toast({
        title: "Subscribed successfully!",
        description: "You will receive our next issue in your inbox.",
      });
    },
    onError: (error) => {
      toast({
        title: "Subscription failed",
        description: "Please check your email address and try again.",
        variant: "destructive",
      });
      console.error("Subscription error:", error);
    },
  });

  const handleSubscribe = ({ email }: SubscribeSchema) => {
    subscribeMutation.mutate({ email });
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col">
      <header className="flex h-14 items-center px-4 lg:px-6">
        <Link className="flex items-center justify-center" href="#">
          <Mail className="mr-2 h-6 w-6" />
          <span className="font-bold">{env.NEXT_PUBLIC_APP_NAME}</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium underline-offset-4 hover:underline"
            href="#about"
          >
            About
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full bg-gradient-to-b from-white to-gray-100 py-12 dark:from-gray-900 dark:to-gray-800 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Stay Ahead of the Curve
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
                  Your weekly dose of cutting-edge news, insights, and trends.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubscribe)}
                    className="flex items-center justify-center space-x-3"
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              className="w-full"
                              type="email"
                              placeholder="user@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={subscribeMutation.isPending}
                    >
                      Subscribe
                    </Button>
                  </form>
                </Form>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Join {isLoading ? 0 : total}+ tech enthusiasts. No spam,
                  unsubscribe anytime.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="about" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="mb-8 text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Why Subscribe?
            </h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-3 text-center">
                <BookOpen className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">In-Depth Analysis</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Get expert insights on the latest tech trends and innovations.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <Sparkles className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Exclusive Content</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Access interviews with industry leaders and exclusive
                  articles.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <Clock className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Weekly Updates</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Stay informed with a concise weekly roundup news.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 {env.NEXT_PUBLIC_APP_NAME} Newsletter. All rights reserved.
        </p>
        <nav className="flex gap-4 sm:ml-auto sm:gap-6">
          <Link className="text-xs underline-offset-4 hover:underline" href="#">
            Privacy Policy
          </Link>
          <Link className="text-xs underline-offset-4 hover:underline" href="#">
            Terms of Service
          </Link>
        </nav>
      </footer>
    </div>
  );
}

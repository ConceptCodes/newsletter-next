import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "@/env";
import { validateTotp } from "../api/utils";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Totp Login",
      credentials: {
        code: { label: "Totp Code", type: "text", placeholder: "000000" },
      },
      async authorize(credentials, req) {
        const user = { id: "1", name: "Admin", email: env.ADMIN_EMAIL };
        const { code } = credentials as { code: string };
        if (validateTotp(code)) {
          return user;
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
} satisfies NextAuthConfig;

import speakeasy from "speakeasy";
import { env } from "@/env";

export function validateTotp(token: string): boolean {
  return speakeasy.totp.verify({
    secret: env.TOTP_SECRET,
    encoding: "base32",
    token,
  });
}

/**
 * Membership boundary. The MVP is open on purpose.
 *
 * TODO(membership): Supabase Auth
 * - Add @supabase/supabase-js when we are ready to ask people to sign in.
 * - Env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * - Replace getMembership() with the signed-in session.
 * - Keep the calculators usable without an account. Gate only future extras
 *   (cloud save, multi-store, shared links), and read the tier from the
 *   server, not from localStorage.
 *
 * TODO(billing): 綠界 ECPay 定期定額
 * - A payment callback needs a server. `output: "export"` cannot receive it.
 *   When billing starts, drop the static export or put the webhook on its own
 *   Node service, then write the paid tier into Supabase.
 * - Never unlock paid features from the browser return URL alone.
 * - Create nothing that charges a card in this MVP. /pricing is a placeholder.
 */

export type MembershipTier = "free" | "member";

export type Membership = {
  tier: MembershipTier;
  signedIn: boolean;
};

export function getMembership(): Membership {
  return { tier: "free", signedIn: false };
}

/** Every current feature stays available. The argument is the future gate id. */
export function canUse(feature: string): boolean {
  void feature;
  return true;
}

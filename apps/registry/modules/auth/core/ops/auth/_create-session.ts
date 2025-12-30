import * as sessionsQueries from "@/modules/auth/core/models/sessions/queries";

import { generateNonce, generateRefreshToken } from "./_refresh-token";

export async function createSession(
  { userId, ipAddress }: { userId: string; ipAddress: string },
  viaTx?: Parameters<typeof sessionsQueries.insert>[1]
) {
  const { nonce, nonceHash } = await generateNonce();

  const [session] = await sessionsQueries.insert(
    { userId, ipAddress, nonceHash },
    viaTx
  );

  const { token: refreshToken } = await generateRefreshToken({
    session,
    nonce,
  });

  return { ...session, refreshToken };
}

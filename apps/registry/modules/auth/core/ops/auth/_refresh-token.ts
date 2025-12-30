import { randomBytes } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";

import type { activeTable as sessions } from "@/modules/auth/core/models/sessions/schemas";

import { hashTarget } from "./_hashing";
import {
  extractSecretPairs,
  generateSaltedKey,
  getKeyFromSecretsMap,
} from "./_jwt-utils";

if (!process.env.REFRESH_TOKEN_SECRETS)
  throw new Error("REFRESH_TOKEN_SECRETS must be set");

// Load and transform the REFRESH_TOKEN_SECRETS environment variable
const { secretsEntries, secretsMap } = extractSecretPairs(
  process.env.REFRESH_TOKEN_SECRETS
);

/** Generates a cspr base64 url-encoded string and its hash */
export async function generateNonce() {
  const nonce = randomBytes(32).toString("base64url");
  return {
    nonce,
    nonceHash: await hashTarget(nonce),
  };
}

/**
 * Generates a JSON Web Signature (JWS) token with a random nonce.
 * This implementation generates a unique salt per token that is stored in a custom `s` header.
 * Using a unique salt per token mitigates some risks of rainbow table attacks and limits exposure if the derived key is compromised
 */
export async function generateRefreshToken({
  session: { id, expiresAt },
  nonce,
}: {
  session: Pick<typeof sessions.$inferSelect, "id" | "expiresAt">;
  nonce?: string;
}) {
  const { kid, salt, key } = await generateSaltedKey(secretsEntries);

  const lazyNonce = nonce
    ? { nonce, nonceHash: undefined } // skip redundant hashing when nonce is passed in
    : await generateNonce();

  const token = await new SignJWT({ nonce: lazyNonce.nonce, sessionId: id })
    .setProtectedHeader({ alg: "HS256", kid, s: salt })
    .setExpirationTime(expiresAt)
    .sign(key, { crit: { kid: true, s: true } });

  return {
    token,
    nonceHash: lazyNonce.nonceHash,
  };
}

/** Verifies the signature of the given JWS token using {@link getKeyFromSecretsMap} and returns its payload */
export async function extractRefreshTokenPayload(
  token: Parameters<typeof jwtVerify>[0]
) {
  const { payload } = await jwtVerify(token, getKeyFromSecretsMap(secretsMap));

  return payload as { exp: number; nonce: string; sessionId: string };
}

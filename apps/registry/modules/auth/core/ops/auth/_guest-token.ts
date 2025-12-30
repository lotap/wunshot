import { randomUUID } from "node:crypto";

import { jwtVerify, SignJWT } from "jose";
import {
  extractSecretPairs,
  generateSaltedKey,
  getKeyFromSecretsMap,
} from "./_jwt-utils";

if (!process.env.GUEST_TOKEN_SECRETS)
  throw new Error("GUEST_TOKEN_SECRETS must be set");

/** Load and transform the GUEST_TOKEN_SECRETS environment variable */
const { secretsEntries, secretsMap } = extractSecretPairs(
  process.env.GUEST_TOKEN_SECRETS
);

type RandomUUID = ReturnType<typeof randomUUID>;

/**
 * Generates a JSON Web Signature (JWS) token with a random uuid.
 * This implementation generates a unique salt per token that is stored in a custom `s` header.
 * Using a unique salt per token mitigates some risks of rainbow table attacks and limits exposure if the derived key is compromised
 */
export async function generateGuestToken(
  {
    id,
    createdAt,
    updatedAt,
  }: { id: RandomUUID; createdAt?: Date; updatedAt?: Date } = {
    id: randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
) {
  const { kid, salt, key } = await generateSaltedKey(secretsEntries);

  const token = await new SignJWT({ id, createdAt, updatedAt })
    .setProtectedHeader({ alg: "HS256", kid, s: salt })
    .sign(key);

  return { token, id };
}

/** Verifies the signature of the given JWS token using {@link getKeyFromSecretsMap} and returns its payload */
export async function extractGuestTokenPayload({ token }: { token: string }) {
  const { payload } = await jwtVerify(token, getKeyFromSecretsMap(secretsMap));

  return payload as { id: RandomUUID; createdAt: Date; updatedAt: Date };
}

import { EncryptJWT, jwtDecrypt } from "jose";

import {
  extractSecretPairs,
  generateSaltedKey,
  getKeyFromSecretsMap,
} from "./_jwt-utils";

if (!process.env.ACCESS_TOKEN_SECRETS)
  throw new Error("ACCESS_TOKEN_SECRETS must be set");

type AccessTokenCustomClaims = { userId: string };

/** The window of time that the access token will remain valid */
const ACCESS_TOKEN_EXPIRATION_MILLISECONDS = 15 * 60 * 1000; // 15 minutes

/** Set the algorithm for the JWE */
const alg = "dir";
/** Set the encoding for the JWE */
const enc = "A256GCM";

/** Load and transform the ACCESS_TOKEN_SECRETS environment variable */
const { secretsEntries, secretsMap } = extractSecretPairs(
  process.env.ACCESS_TOKEN_SECRETS
);

/**
 * Generates a JSON Web Encryption (JWE) token using the provided payload.
 * This implementation generates a unique salt per token that is stored in a custom `s` header.
 * Using a unique salt per token mitigates some risks of rainbow table attacks and limits exposure if the derived key is compromised
 */
export async function generateAccessToken({
  payload,
}: {
  payload: AccessTokenCustomClaims;
}) {
  const { kid, salt, key } = await generateSaltedKey(secretsEntries);

  const exp = Date.now() + ACCESS_TOKEN_EXPIRATION_MILLISECONDS;

  return {
    token: await new EncryptJWT(payload)
      .setProtectedHeader({ alg, enc, kid, s: salt })
      .setExpirationTime(exp)
      .encrypt(key, { crit: { kid: true, s: true } }),
    exp,
  };
}

/** Decrypts a JWE token using {@link getKeyFromSecretsMap} and returns its payload. */
export async function extractAccessTokenPayload(
  token: Parameters<typeof jwtDecrypt>[0]
) {
  const { payload } = await jwtDecrypt(
    token,
    getKeyFromSecretsMap(secretsMap),
    {
      keyManagementAlgorithms: [alg],
      contentEncryptionAlgorithms: [enc],
    }
  );
  return payload as AccessTokenCustomClaims & {
    exp: number;
  };
}

import { hkdf, randomBytes } from "node:crypto";
import type { JWTHeaderParameters } from "jose";

/** Transform a comma-separated list of id:secret pairs into a 2D key-value array and a Map for easy lookup */
export function extractSecretPairs(secretPairsList: string) {
  const secretPairs = secretPairsList.split(",");

  const secretsEntries = secretPairs.map<[id: string, secret: string]>(
    (secretPair) => {
      const [id, secret] = secretPair.split(":");
      if (!id || !secret)
        throw new Error(
          "must be in 'id:secret' format with non-empty id and secret"
        );
      return [id, secret];
    }
  );

  return { secretsEntries, secretsMap: new Map(secretsEntries) };
}

/**
 * Derives an encryption key from the provided secret and salt.
 * Uses the HKDF function to ensure uniform randomness in the generated key, even if the secret is weak
 */
export function deriveHashKey({
  secret,
  salt,
}: {
  secret: Parameters<typeof hkdf>[1];
  salt: Parameters<typeof hkdf>[2];
}) {
  return new Promise((resolve: (value: Uint8Array) => void, reject) => {
    hkdf(
      "sha256",
      secret,
      salt,
      "Generated for ManaBump",
      32,
      (err, derivedKey) => {
        if (err) reject(err);
        resolve(new Uint8Array(derivedKey));
      }
    );
  });
}

/** Generates a salt and uses {@link deriveHashKey} to generate a unique key */
export async function generateSaltedKey(
  secretsEntries: [id: string, secret: string][]
) {
  if (!secretsEntries[0]) throw new Error("secretEntries cannot be empty");

  const [kid, secret] = secretsEntries[0];
  const salt = randomBytes(32).toString("base64url");
  const key = await deriveHashKey({ secret, salt });

  return { kid, salt, key };
}

/**
 * Generates the decryption key by using the provided `kid` and `s` headers of a given JWT.
 * The `s` header is a custom one used for managing a unique salt per token.
 * Looks up the corresponding secret from the given secretsMap and uses HKDF to derive the key.
 */
export function getKeyFromSecretsMap(secretsMap: Map<string, string>) {
  return function getKey({
    kid,
    s,
  }: JWTHeaderParameters & {
    s?: string;
  }) {
    if (!kid)
      throw new Error("`kid` claim is missing in the header parameters");
    if (!s) throw new Error("`s` claim is missing in the header parameters");

    const secret = secretsMap.get(kid);
    if (!secret) throw new Error("Cannot find decryption secret");

    return deriveHashKey({ secret, salt: s });
  };
}

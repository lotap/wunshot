import { hash, verify, type Options } from "@node-rs/argon2";

/**
 * Options based on OWASP recommendations
 * https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id
 * cross-reference https://tobtu.com/minimum-password-settings/
 */
const options: Options = {
  algorithm: 2, // Argon2id
  memoryCost: 32768, // 32 MiB <- Stronger than OWASP recs to account for stronger gpus now available
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

/** Transform given target into a hashed string using Argon2id */
export function hashTarget(target: Parameters<typeof hash>[0]) {
  return hash(target, options);
}

/** Verifies that a given hashed string and target match using Argon2id */
export function verifyTarget(
  hashed: Parameters<typeof verify>[0],
  target: Parameters<typeof verify>[1]
) {
  return verify(hashed, target, options);
}

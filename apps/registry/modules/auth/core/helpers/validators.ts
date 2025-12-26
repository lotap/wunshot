import * as v from "valibot";

// From https://regex101.com/library/8d0bGE
const ARGON2_HASH_REGEX =
  /^\$argon2id\$v=(?:16|19)\$m=\d{1,10},t=\d{1,10},p=\d{1,3}(?:,keyid=[A-Za-z0-9+/]{0,11}(?:,data=[A-Za-z0-9+/]{0,43})?)?\$[A-Za-z0-9+/]{11,64}\$[A-Za-z0-9+/]{16,86}$/iu;

/** Creates a validation action for an argon2 hash */
export const Argon2Hash = v.custom<string>((input) =>
  typeof input === "string" ? ARGON2_HASH_REGEX.test(input) : false
);

/**
 * Create a validation for IP Addresses
 * used mostly because `createInsertSchema` doesn't automatically apply the `ip()` validation to cidr columns
 */
export const IpAddress = v.pipe(v.string(), v.ip());

const PG_VERBOSE_INTERVAL_REGEX =
  /^(?:@ )?(?:(?:\+|-)?infinity)|(?:(?:\d+(?:\.\d+)?) (?:(?:mil(?:s?|lenni(?:um|a)))|(?:c(?:ent(?:ury|uries)?)?)|(?:dec(?:ade)?s?)|(?:y(?:(?:r|ear)s?)?)|(?:q(?:tr|uarter))|(?:mon(?:th)?s?)|(?:w(?:eeks?)?)|(?:d(?:ays?)?)|(?:h(?:(?:r|our)s?)?)|(?:m(?:in(?:ute)?s?)?)|(?:s(?:ec(?:ond)?s?)?)|(?:ms(?:ec(?:ond)?s?)?|millisecon(?:ds?)?)|(?:us(?:ec(?:ond)?s?)?|microsecon(?:ds?)?))(?:(?= \w) |$)){1,13}(?:ago)?$/iu;

/**
 * Create a validation for postgres intervals with verbose syntax
 * https://www.postgresql.org/docs/current/datatype-datetime.html#DATATYPE-INTERVAL-INPUT
 */
export const PGVerboseInterval = v.custom<string>((input) =>
  typeof input === "string" ? PG_VERBOSE_INTERVAL_REGEX.test(input) : false
);

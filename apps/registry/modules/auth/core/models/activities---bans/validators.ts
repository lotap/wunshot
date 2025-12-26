import * as v from "valibot";

export const FailedCredential = v.nullish(
  v.pipe(
    v.unknown(),
    v.transform((input: unknown) => {
      if (typeof input === "string") return input;
      if (typeof input === "undefined" || input === null) return null;
      if (typeof input === "object" && "toString" in input)
        return input.toString();
      try {
        return JSON.stringify(input);
      } catch {
        return String(input);
      }
    }),
    v.union([
      v.pipe(
        v.string(),
        v.transform((input) => input.substring(0, 255))
      ),
      v.null(),
    ])
  ),
  null
);

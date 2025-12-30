import { serializeError } from "serialize-error";

import { withSafeReturn } from "@/modules/auth/core/ops/auth/_safe-return";

import { extractAccessTokenPayload } from "./_access-token";
import { ActivityError } from "./_logging";

const failureOutputMessages = {
  DEFAULT:
    "Authentication failure. Please ensure you are signed in and try again.",
} as const;

async function _verifyAccess({ token }: { token: string }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { exp, ...filteredPayload } = await extractAccessTokenPayload(
    token
  ).catch((error) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { stack, ...errorProps } = serializeError(error);
    throw new ActivityError({
      activity: {
        failureCause: "INVALID_JWE",
        meta: errorProps,
        weight: 20,
      },
      message: failureOutputMessages.DEFAULT,
    });
  });

  /** Return the relevant data directly from the payload */
  return filteredPayload;
}

/**
 * Verify an access token and return data from its payload
 * Logging success is disabled by default to avoid using any database connections
 */
export const verifyAccess = withSafeReturn({
  fn: _verifyAccess,
  label: "AUTH_VERIFY_ACCESS",
  failureOutputMessages,
  logOnSuccessDefault: false,
});

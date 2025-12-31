import { serializeError } from "serialize-error";

import { extractGuestTokenPayload, generateGuestToken } from "./_guest-token";
import { ActivityError } from "./_logging";
import { createOpsFn } from "./_safe-return";

const failureOutputMessages = {
  DEFAULT:
    "Authentication failure. Please ensure you are signed in and try again.",
} as const;

async function _verifyGuest({
  token,
  regenerateToken = true,
}: {
  token: string;
  regenerateToken?: boolean;
}) {
  const { id } = await extractGuestTokenPayload({ token }).catch((error) => {
    /** Realistically should only happen if the secrets have rotated or someone is trying to spoof the token */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { stack, ...errorProps } = serializeError(error);
    throw new ActivityError({
      activity: {
        failureCause: "INVALID_JWS",
        meta: errorProps,
        weight: 20, // Only matters if logFailure is true
      },
      message: failureOutputMessages.DEFAULT,
    });
  });

  /** Create a new JWS to keep the signature "fresh" so future validation checks don't fail */
  /** @todo pass iat */
  const data = regenerateToken
    ? await generateGuestToken({ id })
    : { token: null, id };

  /** Return the relevant data directly from the payload */
  return data;
}

export const verifyGuest = createOpsFn({
  fn: _verifyGuest,
  label: "AUTH_VERIFY_GUEST",
  failureOutputMessages,
  logOnSuccessDefault: false,
  logOnFailureDefault: false,
});

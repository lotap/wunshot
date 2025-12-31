import { serializeError } from "serialize-error";

import { db } from "@/modules/core";
import * as sessionsQueries from "@/modules/auth/core/models/sessions/queries";
import { createOpsFn } from "@/modules/auth/core/ops/auth/_safe-return";

import { generateAccessToken } from "./_access-token";
import { verifyTarget } from "./_hashing";
import { ActivityError } from "./_logging";
import {
  extractRefreshTokenPayload,
  generateRefreshToken,
} from "./_refresh-token";

const failureOutputMessages = {
  DEFAULT:
    "Authentication failure. Please ensure you are signed in and try again.",
} as const;

async function _refresh({
  token,
  ipAddress,
}: {
  token: string;
  ipAddress: string;
}) {
  const { nonce, sessionId } = await extractRefreshTokenPayload(token).catch(
    (error) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { stack, ...errorProps } = serializeError(error);
      throw new ActivityError({
        activity: {
          failureCause: "INVALID_JWS",
          meta: errorProps,
          weight: 20,
        },
        message: failureOutputMessages.DEFAULT,
      });
    }
  );

  /** Find the session by id */
  const [session] = await sessionsQueries.select({ id: sessionId });

  /** If the session is not found, throw an associated error */
  if (!session)
    throw new ActivityError({
      activity: {
        failureCause: "SESSION_NOT_FOUND",
        meta: { sessionId },
        weight: 20,
      },
      message: failureOutputMessages.DEFAULT,
    });

  const { nonceHash, expiresAt } = session;

  /**
   * @todo consider checking bans for ipAddress and userId of the session
   */

  /**
   * Ensure the session has not expired
   * @todo why isn't this done as part of the select query? Document if there's a good reason
   * @todo archive session if it's expired
   */
  if (Date.now() >= expiresAt.getTime())
    throw new ActivityError({
      activity: {
        failureCause: "SESSION_EXPIRED",
        meta: { sessionId, expiresAt },
        weight: 10,
      },
      message: failureOutputMessages.DEFAULT,
    });

  /** Ensure the refresh token matches the hashed one stored in the database */
  const isNonceVerified = await verifyTarget(nonceHash, nonce);

  /** If the refresh token doesn't match, throw an associated error */
  if (!isNonceVerified)
    throw new ActivityError({
      activity: {
        failureCause: "WRONG_NONCE",
        weight: 20,
      },
      message: failureOutputMessages.DEFAULT,
    });

  /** Create a new refresh token and its hash */
  const { token: newRefreshToken, nonceHash: newNonceHash } =
    await generateRefreshToken({ session: { id: sessionId, expiresAt } });

  /** Wrap the auth processes in a transaction */
  const {
    updatedSession: { userId, expiresAt: sessionExpiresAt },
    access: { token: newAccessToken, exp: accessTokenExpiresAt },
  } = await db.transaction(async (tx) => {
    /** Update the existing session's refresh token hash and expiration date */
    const [updatedSession] = await sessionsQueries.updateNonceHash(
      {
        id: sessionId,
        ipAddress,
        nonceHash: newNonceHash!,
      },
      { tx, label: "refresh_auth" }
    );

    /**
     * An update can return an empty array without throwing an error
     * this will catch that and rollback the transaction
     */
    if (!updatedSession)
      throw new ActivityError({
        activity: {
          failureCause: "EMPTY_SESSION_UPDATE",
          meta: { sessionId },
          weight: 1,
        },
        message: failureOutputMessages.DEFAULT,
      });

    /** Create a new encrypted JWT access token */
    const access = await generateAccessToken({
      payload: { userId: updatedSession.userId },
    });

    return { updatedSession, access };
  });

  /** Return the data that's embedded in the JWE as well as data needed to create cookies for refreshing auth */
  return {
    userId,
    newAccessToken,
    accessTokenExpiresAt,
    newRefreshToken,
    sessionExpiresAt,
  } as const;
}

export const refresh = createOpsFn({
  fn: _refresh,
  label: "AUTH_REFRESH",
  failureOutputMessages,
});

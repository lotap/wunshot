import { EXCESSIVE_ACTIVITIES_THRESHOLD } from "@/modules/auth/core/models/activities/consts";
import {
  INITIAL_PENALTY_INTERVAL,
  INITIAL_PENALTY_INTERVAL_QTY,
  INITIAL_PENALTY_INTERVAL_UNIT,
} from "@/modules/auth/core/models/bans/consts";

/**
 * Exponentially increase the penalty time based on the total weight of activities
 *
 * This also means that if a "heavy" activity tips the total weight over the threshold,
 * then the calculated penalty will reflect that.
 * Eg with threshold: 60 & initial interval: 10 minutes
 * - if the total weight is 60, the initial calculated penalty will be 10 minutes
 * - if the total weight is 75, the initial calculated penalty will be ~12 minutes
 * - if the total weight is 90, the initial calculated penalty will be ~14 minutes
 */
export function calculatePenaltyTime(totalWeight: bigint | null) {
  if (totalWeight === null) return INITIAL_PENALTY_INTERVAL;
  if (
    totalWeight > Number.MAX_SAFE_INTEGER ||
    totalWeight < Number.MIN_SAFE_INTEGER
  )
    return "infinity";
  /**
   * 2^0 = 1, so the initial calculated time will use the initial penalty time when the threshold is met.
   *
   * The Math.min function caps the exponent to 20 to keep the number in the safe integer range
   * and to prevent this function from using excessive processing power
   */
  return `${Math.ceil(
    INITIAL_PENALTY_INTERVAL_QTY *
      Math.pow(
        2,
        Math.min(Number(totalWeight) / EXCESSIVE_ACTIVITIES_THRESHOLD - 1, 20)
      )
  )} ${INITIAL_PENALTY_INTERVAL_UNIT}`;
}

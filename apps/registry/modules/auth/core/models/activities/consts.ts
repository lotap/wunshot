/**
 * The threshold for deeming activities as "excessive."
 * If the sum of the weight of activities for a given scope exceeds this threshold in a given time, then the scope target should be rate-limited.
 *
 * This number will need to be adjusted based on the usage/needs of your application.
 * 60 is a good starting point - it's evenly divisible by 2, 3, 4, and 5. And it allows an average of 1 successful activity per 10 seconds with a window of 10 minutes
 *
 * @todo in a future version, this value may be stored in a table instead of as a const
 */
export const EXCESSIVE_ACTIVITIES_THRESHOLD = 60;

export const EXCESSIVE_ACTIVITIES_WINDOW_INTERVAL = `10 minutes`;

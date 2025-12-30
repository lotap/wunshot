import { createLogFns, ActivityError } from "./_logging";

type OpsSuccess<Data> = { success: true; data: Data; message?: never };
type OpsFailure<Message extends string> = {
  success: false;
  data?: never;
  message: Message;
};

export function succeed<Data>(data: Data): OpsSuccess<Data> {
  return { success: true, data };
}

export function fail<Message extends string>(
  message: Message
): OpsFailure<Message> {
  return { success: false, message };
}

type FailuresRecord<FailureMessage extends string> = Record<
  string,
  FailureMessage
>;

function isOutputMessage<FailureMessage extends string>(
  message: string,
  failures: FailuresRecord<FailureMessage>
): message is FailureMessage {
  return Object.values(failures).includes(message as FailureMessage);
}

export function withSafeReturn<
  FnParam extends Record<string, unknown>,
  Data extends Partial<
    Parameters<ReturnType<typeof createLogFns>["logSuccess"]>[0]
  > &
    Record<string, unknown>,
  FailureMessage extends string,
>({
  fn,
  label,
  failureOutputMessages = {
    DEFAULT: "Something went wrong" as FailureMessage,
  },
  logOnSuccessDefault = true,
  logOnFailureDefault = true,
}: {
  fn: (fnParam: FnParam) => Promise<Data>;
  label: Parameters<typeof createLogFns>[0]["label"];
  failureOutputMessages?: FailuresRecord<FailureMessage>;
  logOnSuccessDefault?: boolean;
  logOnFailureDefault?: boolean;
}) {
  return async function _withSafeReturn({
    ipAddress,
    logOnSuccess = logOnSuccessDefault,
    logOnFailure = logOnFailureDefault,
    ...passedProps
  }: {
    ipAddress: Parameters<typeof createLogFns>[0]["ipAddress"];
    logOnSuccess?: boolean;
    logOnFailure?: boolean;
  } & FnParam) {
    const { logFailure, logSuccess } = createLogFns({
      label,
      ipAddress,
    });

    try {
      const data = await fn({
        ipAddress,
        ...passedProps,
      } as unknown as FnParam);
      if (logOnSuccess) await logSuccess(data);

      return succeed(data);
    } catch (error) {
      /** Handle thrown errors by sending them to the activitiesLog */
      if (logOnFailure) await logFailure({ error });

      /** Return the status and an error message */
      return fail(
        error instanceof ActivityError &&
          isOutputMessage(error.message, failureOutputMessages)
          ? error.message
          : failureOutputMessages.DEFAULT
      );
    }
  };
}

import { Prisma } from "@prisma/client";

import { TRPCClientError } from "@trpc/react";

export function getErrorFromUnknown(cause: unknown): Error & { statusCode?: number; code?: string } {
  if (cause instanceof TRPCClientError) {
    return cause;
  } else if (cause instanceof Prisma.PrismaClientKnownRequestError) {
    return cause;
  } else if (cause instanceof Error) {
    return cause;
  } else if (typeof cause === "string") {
    // @ts-expect-error https://github.com/tc39/proposal-error-cause
    return new Error(cause, { cause });
  }

  return new Error(`Unhandled error of type '${typeof cause}''`);
}

export function handleErrorsJson(response: Response) {
  if (!response.ok) {
    response.json().then(console.log);
    throw Error(response.statusText);
  }
  return response.json();
}

export function handleErrorsRaw(response: Response) {
  if (!response.ok) {
    response.text().then(console.log);
    throw Error(response.statusText);
  }
  return response.text();
}

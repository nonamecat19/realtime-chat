export enum ErrorList {
  AUTH_ERROR = 'AUTH_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  YOU_BANNED = 'YOU_BANNED',
  SERVER_ERROR = 'SERVER_ERROR',
  YOU_MUTED = 'YOU_MUTED',
}

export enum ErrorStatuses {
  AUTH_ERROR = 401,
  PERMISSION_ERROR = 403,
  NOT_FOUND = 404,
  TOO_MANY_REQUESTS = 429,
  SERVER_ERROR = 500,
  YOU_BANNED = 600,
  YOU_MUTED = 601,
}

export const ErrorMessages: Record<keyof typeof ErrorList, string> = {
  [ErrorList.AUTH_ERROR]: 'Auth error',
  [ErrorList.PERMISSION_ERROR]: 'Permission error',
  [ErrorList.NOT_FOUND]: 'Not found',
  [ErrorList.TOO_MANY_REQUESTS]: 'Too many requests',
  [ErrorList.SERVER_ERROR]: 'Server errror',
  [ErrorList.YOU_BANNED]: 'You banned',
  [ErrorList.YOU_MUTED]: 'You muted',
} as const;

import { HttpContextToken } from '@angular/common/http';

/** Opt-in: httpErrorInterceptor rethrows the HttpErrorResponse instead of the message string, for callers that
 *  branch on `error.errorCode` (the backend message key) — `message` is localized and must never be parsed. */
export const RAW_HTTP_ERROR = new HttpContextToken<boolean>(() => false);

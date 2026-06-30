import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Uploads files through Angular's HttpClient so the auth (jwt cookie) + CSRF interceptor
 * (core/security/http-error.interceptor.ts) applies — withCredentials + X-XSRF-TOKEN.
 *
 * Why this exists: PrimeNG's <p-fileupload> native XHR bypasses Angular interceptors, so its
 * requests intermittently went out unauthenticated in prod and 401'd users mid-session
 * (kicking ROLE_CLIENT out during document/recibo upload). Use the component's
 * [customUpload]="true" + (uploadHandler) and route the files through here instead.
 */
@Injectable({ providedIn: 'root' })
export class FileUploadService {
  private readonly http = inject(HttpClient);

  /**
   * @param url    full endpoint (same one the p-fileupload [url] used)
   * @param files  event.files from the (uploadHandler) event
   * @param method backend verb — 'post' for documents, 'put' for recibo uploads
   * @param field  multipart field name — 'files' for documents, 'file' for recibo
   */
  upload<T>(url: string, files: File[], method: 'post' | 'put' = 'post', field = 'files'): Observable<T> {
    const form = new FormData();
    files.forEach(f => form.append(field, f, f.name));
    return method === 'put' ? this.http.put<T>(url, form) : this.http.post<T>(url, form);
  }
}

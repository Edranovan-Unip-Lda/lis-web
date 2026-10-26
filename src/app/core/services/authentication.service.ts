import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/entities.model';
import { Role } from '../models/enums';
import { LANG_STORAGE_KEY } from '../i18n/language.service';
import { RAW_HTTP_ERROR } from '../security/http-context';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  protected apiUrl = `${environment.apiUrl}/users`;
  private userKey = 'user';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) { }

  authServer(form: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/authenticate`, form)
      .pipe(
        map(response => {
          // 2FA globally disabled by an admin: this response IS the session — the jwt HttpOnly cookie arrived
          // with it, so store the profile here exactly as validateOTP does. Strict === false so a backend that
          // omits the field keeps the OTP path (fail closed on the client too).
          if (response.otpRequired === false) {
            this.setSession(response);
          }
          return response;
        })
      );
  }

  // loginToken: the single-use transaction token issued by /authenticate — the backend rejects OTP
  // validation/resend without it, so a third party can't burn a victim's OTP attempts.
  validateOTP(username: string, otp: string, loginToken: string): Observable<any> {
    // Errors come back raw: the OTP screen branches on errorCode (see verification.ts).
    return this.http.post<User>(`${this.apiUrl}/otp/${otp}`, { username, loginToken }, { context: new HttpContext().set(RAW_HTTP_ERROR, true) })
      .pipe(
        map(response => {
          this.setSession(response);
          return response;
        })
      );
  }

  regenerateOTP(username: string, loginToken: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/otp/${username}`, { username, loginToken });
  }

  sendForgotPasswordEmail(email: string, recaptchaToken: string): Observable<any> {
    // #22: forward the reCAPTCHA v3 token for backend verification.
    const params = `?email=${encodeURIComponent(email)}&recaptchaToken=${encodeURIComponent(recaptchaToken)}`;
    return this.http.post<User>(`${this.apiUrl}/forgot-password${params}`, { email });
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post<User>(`${this.apiUrl}/reset-password`, data);
  }

  /**
   * Logs out the user, clears the session, and navigates to the login page.
   */
  logout(): void {
    localStorage.removeItem(this.userKey);
    // BUG-WEB-4: redirect whether or not the logout POST succeeds — otherwise a failed call (e.g. the 401 that
    // triggered logout) leaves the app stuck user-less with no navigation.
    this.http.post(`${this.apiUrl}/logout`, {}, { responseType: 'text' }).pipe(take(1)).subscribe({
      next: () => this.router.navigateByUrl('/').then(),
      error: () => this.router.navigateByUrl('/').then()
    });
  }

  private setSession(authResult: any): void {
    const lang = localStorage.getItem(LANG_STORAGE_KEY);
    localStorage.clear();
    if (lang) localStorage.setItem(LANG_STORAGE_KEY, lang);
    // Defense in depth: the session rides in the HttpOnly jwt cookie, so a token or hash must never reach
    // JS-readable storage even if a backend regression puts them back in the body.
    const { password, jwtSession, loginToken, oneTimePassword, ...profile } = authResult ?? {};
    localStorage.setItem(this.userKey, JSON.stringify(profile));
  }

  get currentUserValue(): any {
    const user = localStorage.getItem(this.userKey);
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }

  get currentRole(): any {
    const user = localStorage.getItem(this.userKey);
    if (user) {
      return JSON.parse(user).role;
    }
    return null;
  }

  /**
   * ADMIN, MANAGER and CHIEF see both categorias (Comércio + Indústria); only STAFF is narrowed to its own
   * Direcao. UX mirror of the backend's AuthorizationService#seesAllCategorias, which is the real gate.
   */
  get seesAllCategorias(): boolean {
    return [Role.admin, Role.manager, Role.chief].includes(this.currentRole?.name);
  }
}

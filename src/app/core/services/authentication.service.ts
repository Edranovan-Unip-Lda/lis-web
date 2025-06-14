import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/entities.model';

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
    return this.http.post<User>(`${this.apiUrl}/authenticate`, form);
  }

  validateOTP(username: string, otp: string): Observable<any> {
    return this.http.post<User>(`${this.apiUrl}/otp/${otp}`, { username })
      .pipe(
        map(response => {
          this.setSession(response);
          return response;
        })
      );
  }

  regenerateOTP(username: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/otp/${username}`, { username });
  }

  /**
   * Logs out the user, clears the session, and navigates to the login page.
   */
  logout(): void {
    localStorage.removeItem(this.userKey);
    this.http.post(`${this.apiUrl}/logout`, {}, { responseType: 'text' }).pipe(take(1)).subscribe({
      next: () => this.router.navigateByUrl('/').then()
    });
  }

  private setSession(authResult: any): void {
    localStorage.clear();
    localStorage.setItem(this.userKey, JSON.stringify(authResult));
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
}

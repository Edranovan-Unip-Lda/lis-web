import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OtpSessionService {
  // Choose storage: sessionStorage (clears on tab close) or localStorage (persists until cleared)
  private storage = localStorage;

  // Keys for storing session token and expiration
  private tokenKey = 'otpSessionToken';
  private expirationKey = 'otpSessionExpiration';

  /**
   * Creates an OTP session that lasts 3 minutes.
   * @returns The generated session token.
   */
  createSession(username: string): string {
    const token = username;
    const expiration = Date.now() + 3 * 60 * 1000; // 3 minutes in milliseconds

    this.storage.setItem(this.tokenKey, username);
    this.storage.setItem(this.expirationKey, expiration.toString());

    return token;
  }

  /**
   * Checks whether the OTP session is active and has not expired.
   * @returns True if the session exists and is still valid.
   */
  isSessionActive(): boolean {
    const token = this.storage.getItem(this.tokenKey);
    const expirationStr = this.storage.getItem(this.expirationKey);

    if (!token || !expirationStr) {
      return false;
    }

    const expiration = parseInt(expirationStr, 10);
    if (Date.now() > expiration) {
      this.clearSession();
      return false;
    }
    return true;
  }

  /**
   * Returns the remaining time (in milliseconds) before the session expires.
   * @returns Remaining time in milliseconds; 0 if expired.
   */
  getRemainingTime(): number {
    const expirationStr = this.storage.getItem(this.expirationKey);
    if (!expirationStr) {
      return 0;
    }
    const expiration = parseInt(expirationStr, 10);
    const remaining = expiration - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Clears the OTP session from storage.
   */
  clearSession(): void {
    this.storage.removeItem(this.tokenKey);
    this.storage.removeItem(this.expirationKey);
  }

  /**
   * Generates a simple random token.
   * @returns A random string token.
   */
  private generateRandomToken(): string {
    // For example purposes. In production, consider a more robust solution.
    return Math.random().toString(36).slice(2);
  }
}
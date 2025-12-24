import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NotificacaoDto } from '../models/entities.model';

/**
 * Service responsible for managing notifications in the application.
 * 
 * @remarks
 * This service provides methods to retrieve, mark as read, and manage user notifications.
 * All HTTP requests are configured to complete after the first emission using the `take(1)` operator.
 * 
 * @Injectable
 * The service is provided in the root injector, making it a singleton throughout the application.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificacaoService {
  protected apiUrl = `${environment.apiUrl}/notificacoes`;

  constructor(
    private http: HttpClient,
  ) { }


  /**
   * Retrieves all notifications from the API.
   * 
   * @param page - Optional page number for pagination
   * @param size - Optional page size for pagination
   * @returns An Observable containing the notification data. If pagination parameters are provided,
   *          returns paginated results from the '/page' endpoint, otherwise returns all notifications
   *          from the base endpoint.
   * 
   * @example
   * ```typescript
   * // Get all notifications without pagination
   * notificacaoService.getAll().subscribe(data => console.log(data));
   * 
   * // Get notifications with pagination
   * notificacaoService.getAll(0, 10).subscribe(data => console.log(data));
   * ```
   */
  getAll(page?: number, size?: number): Observable<any> {
    let params = new HttpParams();
    if (page !== undefined && size !== undefined) {
      params = params.append('page', page.toString());
      params = params.append('size', size.toString());
      return this.http.get<any>(`${this.apiUrl}/page`, { params }).pipe(take(1));
    } else {
      return this.http.get<any>(`${this.apiUrl}`).pipe(take(1));
    }
  }

  /**
   * Retrieves all unread notifications for the current user.
   * 
   * @returns An Observable that emits an array of unread notification DTOs and completes after the first emission.
   * 
   * @remarks
   * This method makes a single HTTP GET request to the `/unread` endpoint and automatically
   * unsubscribes after receiving the first response using the `take(1)` operator.
   */
  getUnread(): Observable<NotificacaoDto[]> {
    return this.http.get<NotificacaoDto[]>(`${this.apiUrl}/unread`).pipe(take(1));
  }

  /**
   * Marks a notification as read by sending a PATCH request to the API.
   * 
   * @param notificacaoId - The unique identifier of the notification to be marked as read
   * @returns void - This method does not return a value and does not subscribe to the HTTP request
   * 
   * @remarks
   * Note: The HTTP request is configured with `take(1)` operator but is never subscribed to,
   * meaning the request will not be executed. Consider subscribing to the observable or
   * returning it for external subscription.
   */
  markAsRead(notificacaoId: number): void {
    this.http.patch<void>(`${this.apiUrl}/${notificacaoId}/mark-seen`, {}).pipe(take(1)).subscribe();
  }

  /**
   * Marks all notifications as read by sending a PATCH request to the API.
   * 
   * @remarks
   * This method sends a request to mark all notifications as seen but does not subscribe to the observable.
   * The `take(1)` operator limits the observable to emit only once, but without subscription, the HTTP request won't be executed.
   * Consider subscribing to the observable or using `subscribe()` to ensure the request is actually sent.
   * 
   * @returns void
   */
  markAllAsRead(): void {
    this.http.patch<void>(`${this.apiUrl}/mark-all-seen`, {}).pipe(take(1)).subscribe();
  }

}

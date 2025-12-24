import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { NotificacaoService } from '../services/notificacao.service';

export const getUnreadNotificationsResolver: ResolveFn<any> = () => {
    return inject(NotificacaoService).getUnread();
}
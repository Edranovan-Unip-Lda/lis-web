import { Routes } from '@angular/router';
import { Help } from './help/help';

export default [
    { path: 'help', data: { breadcrumb: 'breadcrumb.ajuda' }, component: Help },
    // { path: '**', redirectTo: '/notfound' }
] as Routes;

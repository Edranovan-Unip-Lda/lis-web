import { Routes } from '@angular/router';
import { Help } from './help/help';

export default [
    { path: 'help', data: { breadcrumb: 'Help' }, component: Help },
    { path: '**', redirectTo: '/notfound' }
] as Routes;

import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Empty } from './empty/empty';
import { Faq } from './faq/faq';
import { Help } from './help/help';

export default [
    {
        path: 'documentation',
        data: { breadcrumb: 'Documentation' },
        component: Documentation
    },
    { path: 'empty', data: { breadcrumb: 'Empty' }, component: Empty },
    { path: 'faq', data: { breadcrumb: 'FAQ' }, component: Faq },
    { path: 'help', data: { breadcrumb: 'Help' }, component: Help },
    { path: '**', redirectTo: '/notfound' }
] as Routes;

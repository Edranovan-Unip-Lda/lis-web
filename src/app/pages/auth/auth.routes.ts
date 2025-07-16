import { validateGuard } from '@/core/security/route.guard';
import { Routes } from '@angular/router';
import { AccessDenied } from './accessdenied';
import { Error } from './error';
import { ForgotPassword } from './forgotpassword';
import { LockScreen } from './lockscreen';
import { Login } from './login/login';
import { Register } from './register/register.component';
import { Verification } from './verification/verification';
import { ActivationComponent } from './activation/activation.component';
import { getTokenActivationResolver } from '@/core/resolvers/user.resolver';
import { getMunicipiosResolver } from '@/core/resolvers/data-master.resolver';
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';

export default [
    {
        path: '',
        component: AuthLayoutComponent,
        children: [
            {
                path: 'login',
                component: Login
            },
            { path: 'error', component: Error },
            { path: 'access', component: AccessDenied },
            { path: 'login', component: Login },
            { path: 'forgotpassword', component: ForgotPassword },
            {
                path: 'register',
                component: Register,
                resolve: {
                    municipiosResolver: getMunicipiosResolver
                }
            },
            {
                path: 'activation',
                component: ActivationComponent,
                resolve: {
                    tokenResolve: getTokenActivationResolver
                }
            },
            {
                path: 'verification',
                component: Verification,
                canActivate: [validateGuard],
            },
            { path: 'lockscreen', component: LockScreen },
            { path: '**', redirectTo: '/notfound' }
        ]
    },
] as Routes;

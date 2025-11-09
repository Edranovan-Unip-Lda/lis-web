import { getAllAldeiasResolver, getRolesResolver, getSociedadeComercialResolver } from '@/core/resolvers/data-master.resolver';
import { getTokenActivationResolver } from '@/core/resolvers/user.resolver';
import { validateGuard } from '@/core/security/route.guard';
import { Routes } from '@angular/router';
import { AccessDenied } from './accessdenied';
import { ActivationComponent } from './activation/activation.component';
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';
import { Error } from './error';
import { ForgotPassword } from './forgot-password/forgotpassword.component';
import { LockScreen } from './lockscreen';
import { Login } from './login/login';
import { Register } from './register/register.component';
import { Verification } from './verification/verification';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

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
            {
                path: 'forgotpassword',
                component: ForgotPassword
            },
            {
                path: 'register',
                component: Register,
                resolve: {
                    aldeiasResolver: getAllAldeiasResolver,
                    listaSociedadeComercial: getSociedadeComercialResolver,
                    roleListResolver: getRolesResolver,
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
            {
                path: 'resetpassword',
                component: ResetPasswordComponent
            },
            { path: 'lockscreen', component: LockScreen },
            { path: '**', redirectTo: '/notfound' }
        ]
    },
] as Routes;

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { of } from "rxjs";
import { Role } from "../models/enums";
import { AuditService, AuthenticationService } from "../services";


export const getAllActivities: ResolveFn<any> = () => {
    const authService = inject(AuthenticationService);
    const auditService = inject(AuditService);
    const role = authService.currentUserValue.role;

    if (role.name !== Role.admin) {
        return of(null);
    }
    const startDateTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDateTime = new Date();
    return auditService.getAllActions(0, 50, startDateTime, endDateTime);
}

export const getLoginActivities: ResolveFn<any> = () => {
    const authService = inject(AuthenticationService);
    const auditService = inject(AuditService);
    const role = authService.currentUserValue.role;

    const startDateTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDateTime = new Date();

    const page = 0;
    const size = 50;

    if (role.name !== Role.admin) {
        return of(null);
    }
    return auditService.getLoginActivities(page, size, startDateTime, endDateTime);

}
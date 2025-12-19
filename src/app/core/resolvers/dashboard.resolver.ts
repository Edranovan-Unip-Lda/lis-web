import { ResolveFn } from "@angular/router";
import { DashboardService } from "../services";
import { inject } from "@angular/core";

export const getDashboardData: ResolveFn<any> = () => {
    const service = inject(DashboardService);
    return service.getData();
}
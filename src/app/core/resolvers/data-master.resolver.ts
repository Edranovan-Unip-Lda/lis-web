import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { DataMasterService } from "../services/data-master.service";

export const getRolesResolver: ResolveFn<any> = () => {
    const service = inject(DataMasterService);
    return service.getRoles();
}
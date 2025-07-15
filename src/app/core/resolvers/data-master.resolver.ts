import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { DataMasterService } from "../services/data-master.service";

export const getRolesResolver: ResolveFn<any> = () => {
    const service = inject(DataMasterService);
    return service.getRoles();
}

export const getMunicipiosResolver: ResolveFn<any> = () => {
    const service = inject(DataMasterService);
    return service.getMunicipios();
}

export const getPostosResolver: ResolveFn<any> = () => {
    const service = inject(DataMasterService);
    return service.getPostos();
}

export const getSucosResolver: ResolveFn<any> = () => {
    const service = inject(DataMasterService);
    return service.getSucos();
}

export const getAldeiasResolver: ResolveFn<any> = () => {
    const service = inject(DataMasterService);
    return service.getAldeias();
}
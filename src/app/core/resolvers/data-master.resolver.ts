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

export const getAllAldeiasResolver: ResolveFn<any> = () => {
    const service = inject(DataMasterService);
    return service.getAllAldeias();
}

export const getAtividadeEconomicaResolver: ResolveFn<any> = () => {
    const service = inject(DataMasterService);
    return service.getAtividadeEconomica();
}

export const getAtividadeEconomicaTipoResolver: ResolveFn<any> = () => {
    const service = inject(DataMasterService);
    return service.getAllAtividadeEconomicaTipo();
}

export const getAtividadeEconomicaAtividadeResolver: ResolveFn<any> = () => {
    const service = inject(DataMasterService);
    return service.getAllAtividadeEconomicaAtividade();
}

export const getTipoRiscoResolver: ResolveFn<any> = () => {
    const service = inject(DataMasterService);
    return service.getTipoRisco();
}

export const getTaxaResolver: ResolveFn<any> = () => {
    const service = inject(DataMasterService);
    return service.getTaxa();
}

export const getSociedadeComercialResolver: ResolveFn<any> = () => {
    const service = inject(DataMasterService);
    return service.getSociedadeComercial();
}

export const getTaxaByCategoriaAndTipoResolver: ResolveFn<any> = (route) => {
    const service = inject(DataMasterService);
    const categoria = route.queryParams['categoria'];
    const tipo = route.queryParams['tipo'];
    console.log(categoria, tipo);

    return service.getAllTaxaByCategoriaAndTipo(categoria, tipo);
}
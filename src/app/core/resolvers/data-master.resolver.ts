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

export const getAllPostosResolver: ResolveFn<any> = () => {
    const service = inject(DataMasterService);
    return service.getPostos(0, 1000);
}

export const getAllSucosResolver: ResolveFn<any> = () => {
    const service = inject(DataMasterService);
    return service.getSucos(0, 1000);
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

export const getPageGrupoAtividadeResolver: ResolveFn<any> = () => {
    const service = inject(DataMasterService);
    return service.getPageGrupoAtividade();
}

export const getAllGrupoAtividadeByTipoResolver: ResolveFn<any> = (route) => {
    const service = inject(DataMasterService);
    const categoria = route.queryParams['categoria'];
    return service.getAllGrupoAtividadeByTipo(categoria);
}


export const getPageClasseAtividadeResolver: ResolveFn<any> = () => {
    const service = inject(DataMasterService);
    return service.getPageClasseAtividade();
}

export const getAllClasseAtividadeByTipoResolver: ResolveFn<any> = (route) => {
    const service = inject(DataMasterService);
    const categoria = route.queryParams['categoria'];
    return service.getAllClasseAtividadeByTipo(categoria);
}

export const getAllClasseAtividadeResolver: ResolveFn<any> = () => {
    const service = inject(DataMasterService);
    return service.getAllClasseAtividade();
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
    return service.getAllTaxaByCategoriaAndTipo(categoria, tipo);
}

export const getDirecaoResolver: ResolveFn<any> = () => {
    const service = inject(DataMasterService);
    return service.getPageDirecao();
}
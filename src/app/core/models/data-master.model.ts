import { BaseModel } from "./base";
import { Categoria, NivelRisco } from "./enums";

export interface Role {
    id: number;
    name: string;
}


export interface Endereco {
    id: number;
    local: string;
    aldeia: Aldeia;
}

export interface Aldeia {
    id: number;
    nome: string;
    suco: Suco;
}

export interface Suco {
    id: number;
    nome: string;
    postoAdministrativo: PostoAdministrativo;
    listaAldeia: Aldeia[];
}

export interface PostoAdministrativo {
    id: number;
    nome: string;
    municipio: Municipio;
    listaSuco: Suco[];
}

export interface Municipio {
    id: number;
    nome: string;
    listaPostoAdministrativo: PostoAdministrativo[];
}

export interface AtividadeEconomica {
    id: number;
    codigo: string;
    descricao: string;
    tipo: Categoria;
}

export interface GrupoAtividade extends BaseModel {
    tipo: Categoria;
    codigo: string;
    descricao: string;
    classes: ClasseAtividade[];
}

export interface ClasseAtividade extends BaseModel {
    grupoAtividade: GrupoAtividade;
    codigo: string;
    descricao: string;
    tipo: Categoria;
    tipoRisco: NivelRisco;
}
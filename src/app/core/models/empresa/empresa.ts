import { BaseModel } from "../base";
import { User } from "../entities.model";

export interface Empresa extends BaseModel {
    nome: string;
    nif: string;
    utilizador: User;
    gerente: string;
    numeroRegistoComercial: string;
    telefone: string;
    telemovel: string;
}

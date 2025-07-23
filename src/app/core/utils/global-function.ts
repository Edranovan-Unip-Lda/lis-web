import { AplicanteType, Categoria, NivelRisco, Role, Status } from "../models/enums";

/**
  * Maps an array of objects to an array of objects with only id and name properties.
  *
  * @param array The array of objects to be mapped.
  * @returns An array of objects with only id and name properties.
  */
export function mapToIdAndName(array: any[]): { id: number, name: string }[] {
    return array.map(item => {
        return {
            id: item.id,
            name: item.name
        };
    });
}

export function mapToIdAndNome(array: any[]): { id: number, nome: string }[] {
    return array.map(item => {
        return {
            id: item.id,
            nome: item.nome
        };
    });
}

export const statusOptions: any[] = [
    { name: Status.active, value: Status.active, icon: 'bi bi-fw bi-shield-check', color: 'text-green-500' },
    { name: Status.pending, value: Status.pending, icon: 'bi bi-fw bi-pause-circle', color: 'text-yellow-500' },
    { name: Status.disabled, value: Status.disabled, icon: 'bi bi-fw bi-ban', color: 'text-red-500' },
];

export const roleOptions: any[] = [
    { name: 'Admin', value: Role.admin },
    { name: 'User', value: Role.staff },
    { name: 'Guest', value: Role.client }
];

export const nivelRiscoOptions: any[] = [
    { name: 'Baixo', value: NivelRisco.baixo },
    { name: 'Medio', value: NivelRisco.medio },
    { name: 'Alto', value: NivelRisco.alto }
];

export const applicationTypesOptions: any[] = [
    {
        name: 'Inscrição no Cadastro',
        value: AplicanteType.cadastro
    },
    {
        name: 'Licenca para Exercicio de Atividade',
        value: AplicanteType.licenca
    }
];
export const categoryTpesOptions: any[] = [
    {
        name: 'Comercial',
        value: Categoria.comercial
    },
    {
        name: 'Industrial',
        value: Categoria.industrial
    }
];
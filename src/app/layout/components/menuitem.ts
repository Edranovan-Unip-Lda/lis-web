interface MenuItem {
    label?: string;
    icon?: string;
    routerLink?: string[];
    url?: string[];
    target?: '_blank' | '_self' | '_parent' | '_top';
    routerLinkActiveOptions?: { [key: string]: any };
    items?: MenuItem[];
    separator?: boolean;
    visible?: boolean;
    disabled?: boolean;
    command?: (event?: any) => void;
    class?: string;
    style?: string;
    styleClass?: string;
    id?: string;
    urlTarget?: '_blank' | '_self' | '_parent' | '_top';
}

export const model_admin: MenuItem[] = [
    {
        label: 'Varanda',
        icon: 'pi pi-home',
        items: [
            {
                label: 'Painél',
                icon: 'pi pi-fw pi-gauge',
                routerLink: ['/dashboard']
            }
        ]
    },
    {
        label: 'Empresa',
        icon: 'bi bi-fw bi-building-fill',
        items: [
            {
                label: 'Lista',
                icon: 'pi pi-fw pi-list',
                routerLink: ['empresa/list']

            },
            {
                label: 'Criar',
                icon: 'pi pi-fw pi-plus',
                routerLink: ['empresa/create']
            }
        ]
    },
    {
        label: 'Aplicante',
        icon: 'pi pi-fw pi-briefcase',
        items: [
            {
                label: 'Lista',
                icon: 'pi pi-fw pi-list',
                routerLink: ['application/list']
            },
            {
                label: 'Criar',
                icon: 'pi pi-fw pi-plus',
                routerLink: ['application/create']
            }
        ]
    },
    {
        label: 'Licenças e Certificados',
        items: [
            {
                label: 'Certificados de Inscricao no Cadastro',
                icon: 'bi bi-fw bi-journal-text',
                items: [
                    {
                        label: 'Comercio',
                        icon: 'bi bi-fw bi-bag',
                        routerLink: ['licencas-certificados/certificados/comercio']
                    },
                    {
                        label: 'Industria',
                        icon: 'bi bi-fw bi-buildings',
                        routerLink: ['licencas-certificados/certificados/industria']

                    }
                ]
            },
            {
                label: 'Alvara de Licenca para Exercicio da Atividade',
                icon: 'bi bi-fw bi-journal-medical',
                items: [
                    {
                        label: 'Comercio',
                        icon: 'bi bi-fw bi-bag',
                        routerLink: ['licencas-certificados/licencas/comercio']
                    },
                    {
                        label: 'Industria',
                        icon: 'bi bi-fw bi-buildings',
                        routerLink: ['licencas-certificados/licencas/industria']
                    }
                ]
            }
        ]
    },
    {
        label: 'Utilizador',
        icon: 'pi pi-fw pi-user',
        items: [
            {
                label: 'Lista',
                icon: 'pi pi-fw pi-list',
                routerLink: ['utilizador/list']
            },
            {
                label: 'Criar',
                icon: 'pi pi-fw pi-plus',
                routerLink: ['utilizador/create']
            }
        ]
    },
    {
        label: 'Dados Mestre',
        items: [
            {
                label: 'Tipo Candidatura',
                icon: 'bi bi-fw bi-ui-checks',
            },
            {
                label: 'Categoria',
                icon: 'bi bi-fw bi-bookmark',
            },
            {
                label: 'Localizacao',
                icon: 'bi bi-fw bi-pin-map',
                items: [
                    {
                        label: 'Municipio'
                    },
                    {
                        label: 'Posto Administrativo'
                    },
                    {
                        label: 'Suco'
                    },
                    {
                        label: 'Aldeia'
                    },
                ]
            },
        ]
    },
    {
        label: 'Historicos',
        items: [
            {
                label: 'Atividades',
                icon: 'bi bi-fw bi-activity'
            },
            {
                label: 'Autenticacao',
                icon: 'bi bi-fw bi-unlock'
            }
        ]
    }
];

export const model_client: MenuItem[] = [
    {
        label: 'Varanda',
        icon: 'pi pi-home',
        items: [
            {
                label: 'Início',
                icon: 'pi pi-fw pi-home',
                routerLink: ['/home']
            }
        ]
    },
    {
        label: 'Aplicante',
        icon: 'pi pi-fw pi-briefcase',
        items: [
            {
                label: 'Lista',
                icon: 'pi pi-fw pi-list',
                routerLink: ['application/list']
            },
        ]
    },
    {
        label: 'Licenças e Certificados',
        items: [
            {
                label: 'Lista',
                icon: 'pi pi-fw pi-list',
                routerLink: ['licencas-certificados/list']
            },
        ]
    },
    {
        label: 'Historicos',
        items: [
            {
                label: 'Autenticacao',
                icon: 'bi bi-fw bi-unlock'
            }
        ]
    }
];
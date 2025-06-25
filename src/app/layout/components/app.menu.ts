import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppMenuitem } from './app.menuitem';

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

@Component({
    selector: '[app-menu]',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu" #menuContainer>
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul>`,
    host: {
        class: 'layout-menu-container'
    }
})
export class AppMenu {
    el: ElementRef = inject(ElementRef);

    @ViewChild('menuContainer') menuContainer!: ElementRef;

    model: MenuItem[] = [
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
            label: 'Candidatura',
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
}

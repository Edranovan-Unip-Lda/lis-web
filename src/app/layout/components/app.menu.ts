import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppMenuitem } from './app.menuitem';
import { AuthenticationService } from '@/core/services';
import { Role } from '@/core/models/enums';
import { model_admin, model_client, model_manager, model_staff } from './menuitem';

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

    model: any[] = [];

    constructor(
        private authService: AuthenticationService
    ) {
        // Pick the role's base menu. These are shared module-level constants, so never mutate them —
        // build a fresh array (spread) below, otherwise pushing docMenu accumulates duplicates across
        // AppMenu re-instantiations (logout→login, layout recreation) for every role sharing the array.
        let base: any[] = [];
        switch (this.authService.currentRole.name) {
            case Role.admin:
                base = model_admin;
                break;
            case Role.manager:
            case Role.chief:
                base = model_manager;
                break;
            case Role.staff:
                base = model_staff;
                break;
            case Role.client:
                base = model_client;
                break;
        }
        const docMenu = {
            label: 'Documentação',
            items: [
                {
                    label: 'Manual do Utilizador',
                    icon: 'bi bi-fw bi-file-earmark-text',
                    url: ['https://drive.google.com/file/d/1A8g_iC9E8js0gQZbXcxXmua1pAwYiQTw/view?usp=drive_link'],
                    target: '_blank'
                }
            ]
        };
        this.model = this.scopeToDirecao([...base, docMenu]);
    }

    /**
     * Drop the menu entries belonging to the other Direcao. Leaves that are categoria-specific carry their
     * Categoria in `id` (see menuitem.ts); everything untagged always survives. ADMIN has no Direcao and keeps
     * both. This is UX only — the backend rejects an out-of-direcao request regardless.
     */
    private scopeToDirecao(items: any[]): any[] {
        const user = this.authService.currentUserValue;
        const direcao = user?.direcao?.nome;
        if (!direcao || user?.role?.name === Role.admin) return items;

        // Rebuild rather than mutate: `items` still holds the shared module-level constants' child arrays.
        const prune = (list: any[]): any[] =>
            list
                .filter((item) => !item.id || item.id === direcao)
                .map((item) => (item.items ? { ...item, items: prune(item.items) } : item));

        return prune(items);
    }

}

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
        switch (this.authService.currentRole.name) {
            case Role.admin:
                this.model = model_admin;
                break;
            case Role.manager:
            case Role.chief:
                this.model = model_manager;
                break;
            case Role.staff:
                this.model = model_staff;
                break;
            case Role.client:
                this.model = model_client;
                break;
        }

    }

}

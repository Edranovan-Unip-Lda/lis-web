import { User } from '@/core/models/entities.model';
import { StatusIconPipe, StatusSeverityPipe } from '@/core/pipes/custom.pipe';
import { CustomerService } from '@/pages/service/customer.service';
import { Customer } from '@/types/customer';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'user-list',
    standalone: true,
    imports: [CommonModule, TableModule, InputTextModule, ProgressBarModule, ButtonModule, IconField, InputIcon, RouterModule, TagModule, StatusSeverityPipe, StatusIconPipe],
    templateUrl: './userlist.html',
    providers: [CustomerService]
})
export class UserList {
    customers: Customer[] = [];
    users: User[] = [];

    constructor(
        private customerService: CustomerService,
        private router: Router,
        private route: ActivatedRoute,
    ) {
        this.users = this.route.snapshot.data['userPage'].content;
    }

    ngOnInit() {
        this.customerService.getCustomersLarge().then((customers) => (this.customers = customers));
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    navigateToCreateUser() {
        this.router.navigate(['profile/create']);
    }
}

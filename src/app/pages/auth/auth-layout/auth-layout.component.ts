import { LayoutService } from '@/layout/service/layout.service';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterModule],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss'
})
export class AuthLayoutComponent {
  layoutService = inject(LayoutService);
  readonly startYear = 2026;
  readonly currentYear = new Date().getFullYear();

  get copyrightYears(): string {
    return this.currentYear > this.startYear
      ? `${this.startYear}–${this.currentYear}`
      : `${this.startYear}`;
  }
}

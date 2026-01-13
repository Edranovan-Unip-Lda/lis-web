import { LayoutService } from '@/layout/service/layout.service';
import { Component, inject } from '@angular/core';
import { Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterModule } from '@angular/router';
import { ProgressBar } from 'primeng/progressbar';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterModule, ProgressBar],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss'
})
export class AuthLayoutComponent {
  layoutService = inject(LayoutService);
  readonly startYear = 2026;
  readonly currentYear = new Date().getFullYear();
  showProgressBar = false;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    this.router.events.subscribe((event: Event) => {

      switch (true) {
        case event instanceof NavigationStart: {
          this.showProgressBar = true;
          break;
        }

        case event instanceof NavigationEnd:
        case event instanceof NavigationCancel:
        case event instanceof NavigationError: {
          this.showProgressBar = false;
          break;
        }
        default: {
          break;
        }
      }
    });
  }

  get copyrightYears(): string {
    return this.currentYear > this.startYear
      ? `${this.startYear}–${this.currentYear}`
      : `${this.startYear}`;
  }
}

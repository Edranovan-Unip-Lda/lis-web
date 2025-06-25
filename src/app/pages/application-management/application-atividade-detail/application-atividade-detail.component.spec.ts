import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationAtividadeDetailComponent } from './application-atividade-detail.component';

describe('ApplicationAtividadeDetailComponent', () => {
  let component: ApplicationAtividadeDetailComponent;
  let fixture: ComponentFixture<ApplicationAtividadeDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationAtividadeDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationAtividadeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

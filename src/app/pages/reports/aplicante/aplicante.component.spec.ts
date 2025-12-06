import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AplicanteComponent } from './aplicante.component';

describe('AplicanteComponent', () => {
  let component: AplicanteComponent;
  let fixture: ComponentFixture<AplicanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AplicanteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AplicanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

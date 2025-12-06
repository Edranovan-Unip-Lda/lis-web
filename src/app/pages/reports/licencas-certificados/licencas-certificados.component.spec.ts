import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicencasCertificadosComponent } from './licencas-certificados.component';

describe('LicencasCertificadosComponent', () => {
  let component: LicencasCertificadosComponent;
  let fixture: ComponentFixture<LicencasCertificadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicencasCertificadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LicencasCertificadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

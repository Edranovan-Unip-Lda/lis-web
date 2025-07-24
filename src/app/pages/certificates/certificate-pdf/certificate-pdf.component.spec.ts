import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificatePdfComponent } from './certificate-pdf.component';

describe('CertificatePdfComponent', () => {
  let component: CertificatePdfComponent;
  let fixture: ComponentFixture<CertificatePdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificatePdfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificatePdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

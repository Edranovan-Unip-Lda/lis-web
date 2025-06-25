import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificadosListaComponent } from './certificados-lista.component';

describe('CertificadosListaComponent', () => {
  let component: CertificadosListaComponent;
  let fixture: ComponentFixture<CertificadosListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificadosListaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificadosListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

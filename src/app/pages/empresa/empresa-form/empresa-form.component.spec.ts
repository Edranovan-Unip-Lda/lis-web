import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { EmpresaFormComponent } from './empresa-form.component';
import { AuthenticationService, DataMasterService, EmpresaService } from '@/core/services';
import { DocumentosService } from '@/core/services/documentos.service';
import { MessageService } from 'primeng/api';

describe('EmpresaFormComponent', () => {
  let component: EmpresaFormComponent;
  let fixture: ComponentFixture<EmpresaFormComponent>;

  const mockAldeias = [
    { nome: 'Aldeia Test', id: 1 },
    { nome: 'Aldeia Test 2', id: 2 },
  ];
  const mockSociedadeComercial = [
    { nome: 'Sociedade Unipessoal Lda', id: 1 },
    { nome: 'Sociedade por Quotas', id: 2 },
  ];

  const mockActivatedRoute = {
    snapshot: {
      data: {
        aldeiasResolver: {
          _embedded: { aldeias: mockAldeias }
        },
        listaSociedadeComercial: {
          _embedded: { sociedadeComercial: mockSociedadeComercial }
        },
        empresaResolver: null,
      }
    }
  };

  const mockDataMasterService = {
    getAldeiaById: jasmine.createSpy('getAldeiaById').and.returnValue(of({
      suco: {
        nome: 'Suco Test',
        postoAdministrativo: {
          nome: 'Posto Test',
          municipio: { nome: 'Municipio Test' }
        }
      }
    })),
    searchAldeiasByNome: jasmine.createSpy('searchAldeiasByNome').and.returnValue(of({
      _embedded: { aldeias: mockAldeias }
    })),
  };

  const mockEmpresaService = {
    update: jasmine.createSpy('update').and.returnValue(of({})),
  };

  const mockDocumentosService = {
    downloadById: jasmine.createSpy('downloadById').and.returnValue(of(new Blob())),
    deleteById: jasmine.createSpy('deleteById').and.returnValue(of(null)),
  };

  const mockAuthService = {
    currentUserValue: { username: 'testuser' },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpresaFormComponent, ReactiveFormsModule],
      providers: [
        provideNoopAnimations(),
        provideHttpClient(),
        FormBuilder,
        MessageService,
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: DataMasterService, useValue: mockDataMasterService },
        { provide: EmpresaService, useValue: mockEmpresaService },
        { provide: DocumentosService, useValue: mockDocumentosService },
        { provide: AuthenticationService, useValue: mockAuthService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmpresaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('disableStepEmpresa()', () => {
    /**
     * Helper to fill all required fields for step 1 (Empresa).
     * Sets valid values for every control checked by disableStepEmpresa().
     */
    function fillStepEmpresaFields(): void {
      component.empresaForm.patchValue({
        nome: 'Empresa Teste Lda',
        nif: 'ABC123',
        sede: {
          local: 'Rua Principal, 123',
          aldeia: { nome: 'Aldeia Test', value: 1 },
        },
        sociedadeComercial: { nome: 'Sociedade Unipessoal Lda', value: 1 },
        numeroRegistoComercial: 'RC001',
        capitalSocial: 50000,
        dataRegisto: new Date(2024, 0, 1),
        telefone: '12345678',
        telemovel: '87654321',
        totalTrabalhadores: 10,
        volumeNegocioAnual: 200000,
        balancoTotalAnual: 100000,
        latitude: -8.5,
        longitude: 125.5,
        email: 'empresa@test.com',
      });
      // Simulate 5 uploaded docs
      component.uploadedDocs = [
        { id: 1, nome: 'doc1.pdf', tamanho: 1024 },
        { id: 2, nome: 'doc2.pdf', tamanho: 1024 },
        { id: 3, nome: 'doc3.pdf', tamanho: 1024 },
        { id: 4, nome: 'doc4.pdf', tamanho: 1024 },
        { id: 5, nome: 'doc5.pdf', tamanho: 1024 },
      ];
    }

    it('should return true (disabled) when form is empty', () => {
      expect(component.disableStepEmpresa()).toBeTrue();
    });

    it('should return false (enabled) when all required fields are filled', () => {
      fillStepEmpresaFields();
      expect(component.disableStepEmpresa()).toBeFalse();
    });

    it('should return true when nome is missing', () => {
      fillStepEmpresaFields();
      component.empresaForm.patchValue({ nome: null });
      expect(component.disableStepEmpresa()).toBeTrue();
    });

    it('should return true when sede.local is missing', () => {
      fillStepEmpresaFields();
      component.empresaForm.get('sede')?.patchValue({ local: null });
      expect(component.disableStepEmpresa()).toBeTrue();
    });

    it('should return true when sede.aldeia is missing', () => {
      fillStepEmpresaFields();
      component.empresaForm.get('sede')?.patchValue({ aldeia: null });
      expect(component.disableStepEmpresa()).toBeTrue();
    });

    it('should return true when nif is missing', () => {
      fillStepEmpresaFields();
      component.empresaForm.patchValue({ nif: null });
      expect(component.disableStepEmpresa()).toBeTrue();
    });

    it('should return true when numeroRegistoComercial is missing', () => {
      fillStepEmpresaFields();
      component.empresaForm.patchValue({ numeroRegistoComercial: null });
      expect(component.disableStepEmpresa()).toBeTrue();
    });

    it('should return true when capitalSocial is missing', () => {
      fillStepEmpresaFields();
      component.empresaForm.patchValue({ capitalSocial: null });
      expect(component.disableStepEmpresa()).toBeTrue();
    });

    it('should return true when dataRegisto is missing', () => {
      fillStepEmpresaFields();
      component.empresaForm.patchValue({ dataRegisto: null });
      expect(component.disableStepEmpresa()).toBeTrue();
    });

    it('should return true when uploadedDocs does not have exactly 5 items', () => {
      fillStepEmpresaFields();
      component.uploadedDocs = [
        { id: 1, nome: 'doc1.pdf', tamanho: 1024 },
        { id: 2, nome: 'doc2.pdf', tamanho: 1024 },
      ];
      expect(component.disableStepEmpresa()).toBeTrue();
    });

    it('should return true when uploadedDocs is empty', () => {
      fillStepEmpresaFields();
      component.uploadedDocs = [];
      expect(component.disableStepEmpresa()).toBeTrue();
    });

    it('sociedadeComercial should be valid with an object value from p-select', () => {
      fillStepEmpresaFields();
      const ctrl = component.empresaForm.get('sociedadeComercial');
      expect(ctrl?.value).toEqual({ nome: 'Sociedade Unipessoal Lda', value: 1 });
      expect(ctrl?.valid).withContext(
        'sociedadeComercial should be valid when an option is selected'
      ).toBeTrue();
    });

    it('should identify which fields cause disableStepEmpresa to return true', () => {
      // Fill everything EXCEPT uploadedDocs
      component.empresaForm.patchValue({
        nome: 'Empresa Teste Lda',
        nif: 'ABC123',
        sede: {
          local: 'Rua Principal, 123',
          aldeia: { nome: 'Aldeia Test', value: 1 },
        },
        sociedadeComercial: { nome: 'Sociedade Unipessoal Lda', value: 1 },
        numeroRegistoComercial: 'RC001',
        capitalSocial: 50000,
        dataRegisto: new Date(2024, 0, 1),
        telefone: '12345678',
        telemovel: '87654321',
        totalTrabalhadores: 10,
        volumeNegocioAnual: 200000,
        balancoTotalAnual: 100000,
        latitude: -8.5,
        longitude: 125.5,
        email: 'empresa@test.com',
      });

      // With 0 docs, button should be disabled
      component.uploadedDocs = [];
      expect(component.disableStepEmpresa()).withContext('0 docs → disabled').toBeTrue();

      // With 3 docs, button should still be disabled (requires exactly 5)
      component.uploadedDocs = [
        { id: 1, nome: 'doc1.pdf', tamanho: 1024 },
        { id: 2, nome: 'doc2.pdf', tamanho: 1024 },
        { id: 3, nome: 'doc3.pdf', tamanho: 1024 },
      ];
      expect(component.disableStepEmpresa()).withContext('3 docs → disabled').toBeTrue();

      // With exactly 5 docs, button should be enabled
      component.uploadedDocs = [
        { id: 1, nome: 'doc1.pdf', tamanho: 1024 },
        { id: 2, nome: 'doc2.pdf', tamanho: 1024 },
        { id: 3, nome: 'doc3.pdf', tamanho: 1024 },
        { id: 4, nome: 'doc4.pdf', tamanho: 1024 },
        { id: 5, nome: 'doc5.pdf', tamanho: 1024 },
      ];
      expect(component.disableStepEmpresa()).withContext('5 docs → enabled').toBeFalse();

      // With 6 docs, button should be disabled again (requires EXACTLY 5)
      component.uploadedDocs.push({ id: 6, nome: 'doc6.pdf', tamanho: 1024 });
      expect(component.disableStepEmpresa()).withContext('6 docs → disabled').toBeTrue();
    });

    it('BUG: aldeia check at top level is dead code (should be sede.aldeia)', () => {
      // empresaForm.get('aldeia') returns null — there is no top-level 'aldeia' control.
      // It's nested under 'sede.aldeia'. The check is dead code.
      const ctrl = component.empresaForm.get('aldeia');
      expect(ctrl).withContext(
        'There is no top-level "aldeia" control — it is "sede.aldeia"'
      ).toBeNull();
    });
  });

  describe('form initialization', () => {
    it('should initialize empresaForm with all required controls', () => {
      expect(component.empresaForm).toBeTruthy();
      expect(component.empresaForm.get('nome')).toBeTruthy();
      expect(component.empresaForm.get('nif')).toBeTruthy();
      expect(component.empresaForm.get('sede')).toBeTruthy();
      expect(component.empresaForm.get('sede.local')).toBeTruthy();
      expect(component.empresaForm.get('sede.aldeia')).toBeTruthy();
      expect(component.empresaForm.get('sociedadeComercial')).toBeTruthy();
      expect(component.empresaForm.get('numeroRegistoComercial')).toBeTruthy();
      expect(component.empresaForm.get('capitalSocial')).toBeTruthy();
      expect(component.empresaForm.get('dataRegisto')).toBeTruthy();
      expect(component.empresaForm.get('latitude')).toBeTruthy();
      expect(component.empresaForm.get('longitude')).toBeTruthy();
      expect(component.empresaForm.get('email')).toBeTruthy();
    });

    it('should have sociedadeComercial as required', () => {
      const ctrl = component.empresaForm.get('sociedadeComercial');
      ctrl?.setValue(null);
      expect(ctrl?.hasError('required')).toBeTrue();
    });

    it('sociedadeComercial should be valid with an object value from p-select', () => {
      const ctrl = component.empresaForm.get('sociedadeComercial');
      ctrl?.setValue({ nome: 'Sociedade por Quotas', value: 2 });
      // This test will fail if alphanumericValidator is still on sociedadeComercial
      expect(ctrl?.valid).withContext(
        'p-select sets object values; alphanumericValidator incorrectly rejects them'
      ).toBeTrue();
    });
  });
});

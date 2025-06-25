import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicencasListaComponent } from './licencas-lista.component';

describe('LicencasListaComponent', () => {
  let component: LicencasListaComponent;
  let fixture: ComponentFixture<LicencasListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicencasListaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LicencasListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

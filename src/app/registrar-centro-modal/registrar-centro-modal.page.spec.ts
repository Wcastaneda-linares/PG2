import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RegistrarCentroModalPage } from './registrar-centro-modal.page';

describe('RegistrarCentroModalPage', () => {
  let component: RegistrarCentroModalPage;
  let fixture: ComponentFixture<RegistrarCentroModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RegistrarCentroModalPage],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarCentroModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LlenarInformacionPage } from './llenar-informacion.page';

describe('LlenarInformacionPage', () => {
  let component: LlenarInformacionPage;
  let fixture: ComponentFixture<LlenarInformacionPage>;

  // Reemplazar async con waitForAsync
  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(LlenarInformacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

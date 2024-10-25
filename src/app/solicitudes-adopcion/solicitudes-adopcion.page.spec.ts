import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SolicitudesAdopcionPage } from './solicitudes-adopcion.page';

describe('SolicitudesAdopcionPage', () => {
  let component: SolicitudesAdopcionPage;
  let fixture: ComponentFixture<SolicitudesAdopcionPage>;

  // Reemplazar async con waitForAsync
  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(SolicitudesAdopcionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

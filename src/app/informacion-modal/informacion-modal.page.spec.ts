import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InformacionModalPage } from './informacion-modal.page';

describe('InformacionModalPage', () => {
  let component: InformacionModalPage;
  let fixture: ComponentFixture<InformacionModalPage>;

  // Reemplazar async con waitForAsync
  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(InformacionModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

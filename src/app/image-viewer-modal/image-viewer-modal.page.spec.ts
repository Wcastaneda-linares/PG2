import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ImageViewerModalPage } from './image-viewer-modal.page';

describe('ImageViewerModalPage', () => {
  let component: ImageViewerModalPage;
  let fixture: ComponentFixture<ImageViewerModalPage>;

  // Reemplazar async con waitForAsync
  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ImageViewerModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

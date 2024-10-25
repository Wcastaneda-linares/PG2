import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DocumentViewerModalPageComponent } from './document-viewer-modal-page.component';

describe('DocumentViewerModalPageComponent', () => {
  let component: DocumentViewerModalPageComponent;
  let fixture: ComponentFixture<DocumentViewerModalPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentViewerModalPageComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentViewerModalPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

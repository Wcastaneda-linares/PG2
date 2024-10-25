import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { UserService } from './user-service.page';

describe('UserService', () => {
  let component: UserService;
  let fixture: ComponentFixture<UserService>;

  // Reemplazar async con waitForAsync
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UserService],  // Corregir el componente
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

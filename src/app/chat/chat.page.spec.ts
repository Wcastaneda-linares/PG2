import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChatPage } from './chat.page';
import { ChatService } from '../chat.service';
import { of } from 'rxjs';

describe('ChatPage', () => {
  let component: ChatPage;
  let fixture: ComponentFixture<ChatPage>;
  let chatServiceSpy: jasmine.SpyObj<ChatService>;

  // Reemplazar async con waitForAsync
  beforeEach(waitForAsync(() => {
    const spy = jasmine.createSpyObj('ChatService', ['obtenerMensajes', 'enviarMensaje']);

    TestBed.configureTestingModule({
      declarations: [ ChatPage ],
      providers: [{ provide: ChatService, useValue: spy }]
    })
    .compileComponents();

    chatServiceSpy = TestBed.inject(ChatService) as jasmine.SpyObj<ChatService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería obtener mensajes al iniciar', () => {
    const mensajesMock = [{ contenido: 'Hola', timestamp: Date.now() }];
    chatServiceSpy.obtenerMensajes.and.returnValue(of(mensajesMock));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.mensajes.length).toBe(1);
    expect(component.mensajes[0].contenido).toBe('Hola');
  });

  it('debería enviar mensaje y limpiar el campo de entrada', () => {
    component.nuevoMensaje = 'Nuevo mensaje';
    component.enviarMensaje();
    
    expect(chatServiceSpy.enviarMensaje).toHaveBeenCalled();
    expect(component.nuevoMensaje).toBe('');
  });
});

import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef  } from '@angular/core';
import { ChatService } from '../chat.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit, AfterViewInit {
  mensajes: any[] = [];
  nuevoMensaje: string = '';
  respuestaMensaje: string = '';
  mensajeSeleccionado: any = null;
  userRole: string | null = null;
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  usuario: string = '';

  constructor(
    private chatService: ChatService, 
    private cd: ChangeDetectorRef,
    private afs: AngularFirestore 
  ) {}

  ngOnInit() {

    const rolGuardado = localStorage.getItem('userRole');
  
    if (rolGuardado) {
      this.userRole = rolGuardado;
      this.cd.detectChanges(); // Fuerza la detección de cambios
      
      // Recuperar el nombre del usuario almacenado en localStorage
      const nombreUsuarioGuardado = localStorage.getItem('nombreUsuario');
      console.log('Nombre de usuario recuperado desde localStorage:', nombreUsuarioGuardado); // Verificar el nombre recuperado
  
      if (nombreUsuarioGuardado) {
        this.usuario = nombreUsuarioGuardado; // Asignamos el nombre del usuario al campo 'usuario'
      } else {
        console.warn('No se encontró el nombre del usuario en localStorage');
        this.usuario = 'Desconocido'; // Valor por defecto si no se encuentra el nombre en localStorage
      }

      console.log('Rol de usuario:', this.userRole);
      console.log('Nombre de usuario:', this.usuario);
  
      this.obtenerMensajes(); // Obtenemos los mensajes del chat
    }
  }
  
  
  
  ionViewWillEnter() {
    console.log('Chat se ha vuelto activa');
    this.cargarDatos();
    this.obtenerMensajes(); // Asegúrate de recargar los mensajes al entrar
    this.cd.detectChanges(); 
  }

  cargarDatos() {
    console.log('Datos recargados en Chat');
    // Aquí va la lógica para refrescar los datos en esta tab.
  }
  
  
  ngAfterViewInit() {
    setTimeout(() => this.scrollToBottom(), 100);
  }

  enviarMensaje() {
    if (this.nuevoMensaje.trim()) {
      const mensaje = {
        contenido: this.nuevoMensaje,
        usuario: this.usuario || 'Desconocido', // El nombre del usuario se toma de this.usuario
        timestamp: new Date().toISOString(),
        respuestas: [],
      };
      this.chatService.enviarMensaje(mensaje); // Envía el mensaje a través del servicio
      this.nuevoMensaje = ''; // Limpia el campo de entrada
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }
  
  

  esAdmin(): boolean {
    return this.userRole === 'admin';
  }
    
    
    eliminarMensaje(mensaje: any) {
      this.chatService.eliminarMensaje(mensaje.id)
        .then(() => {
          console.log('Mensaje eliminado correctamente');
          this.obtenerMensajes(); // Refrescar los mensajes después de la eliminación
        })
        .catch((error: any) => console.error('Error al eliminar el mensaje:', error)); // Define el tipo como 'any'
    }
    

  enviarRespuesta() {
    if (!this.mensajeSeleccionado?.id) {
      console.error('No se seleccionó un mensaje válido para responder.');
      return;
    }
  
    const respuesta = {
      contenido: this.respuestaMensaje.trim(),
      usuario: this.usuario || 'Desconocido',
      timestamp: new Date().toISOString(),
    };
  
    this.chatService
      .agregarRespuesta(this.mensajeSeleccionado.id, respuesta)
      .then(() => {
        console.log('Respuesta enviada correctamente');
        this.respuestaMensaje = '';
        this.mensajeSeleccionado = null;
        setTimeout(() => this.scrollToBottom(), 100);
      })
      .catch((error) => console.error('Error al enviar respuesta:', error));
  }
  

  seleccionarMensaje(mensaje: any) {
    this.mensajeSeleccionado = mensaje;
    this.cd.detectChanges(); // Forzar la detección de cambios para reflejar el cambio visualmente
  }
  
  ngAfterViewChecked() {
    this.cd.detectChanges(); // Fuerza la detección de cambios cada vez que la vista cambia
  }


  cancelarRespuesta() {
    this.mensajeSeleccionado = null; // Elimina el mensaje seleccionado
    this.nuevoMensaje = ''; // Limpia el campo de texto de nuevo mensaje
  }

  obtenerDatosUsuario(uid: string) {
    // Se conecta a Firestore para obtener el documento del usuario con el UID proporcionado
    this.afs.collection('users').doc(uid).valueChanges().subscribe(
      (userData: any) => {
        if (userData && userData.name) {
          // Si se encuentra el nombre, se asigna al campo 'usuario'
          this.usuario = userData.name;
          console.log('Nombre de usuario obtenido desde Firestore:', this.usuario);
        } else {
          // Si no se encuentra el campo 'name' en Firestore, asigna un valor por defecto
          console.warn('No se encontraron datos del usuario en Firestore.');
          this.usuario = 'Desconocido';
        }
      },
      (error) => {
        // Manejo de errores al obtener los datos del usuario
        console.error('Error al obtener datos del usuario desde Firestore:', error);
        this.usuario = 'Desconocido'; // Asigna un valor por defecto en caso de error
      }
    );
  }
  
  

  obtenerMensajes() {
    this.chatService.obtenerMensajes().subscribe((mensajes: any[]) => {
      this.mensajes = mensajes;
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  private scrollToBottom() {
    try {
      if (this.chatContainer?.nativeElement) {
        this.chatContainer.nativeElement.scrollTop =
          this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (error) {
      console.error('Error al hacer scroll:', error);
    }
  }
  
    
}

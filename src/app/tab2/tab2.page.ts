interface Usuario {
  name: string;
  email: string;
  birthDate?: string;
  role: string;
}

import { FormularioAdopcionComponent } from '../formulario-adopcion/formulario-adopcion.component';
import { firstValueFrom } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController, ActionSheetController, ToastController } from '@ionic/angular';
import { FireserviceService } from '../fireservice.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ImageViewerModalPage } from '../image-viewer-modal/image-viewer-modal.page';
import firebase from 'firebase/compat/app';
import { arrayUnion } from 'firebase/firestore';
import { AlertController } from '@ionic/angular'; 
import { EmailService } from '../services/email.service'; // Importa el servicio de correo
import { Share } from '@capacitor/share';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
})
export class Tab2Page implements OnInit {
  publicaciones: any[] = [];
  user: any;
  userRole: string = '';
  tiposDeMascotas: string[] = ['Todos']; // Por defecto, incluir "Todos"
  filtroTipoMascota: string = 'Todos'; // Por defecto, "Todos"

  

  constructor(
    private storage: AngularFireStorage,
    private firestore: AngularFirestore,
    private fireService: FireserviceService,
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController,
    private afAuth: AngularFireAuth,
    private alertController: AlertController, // Agrega esta línea
    private emailService: EmailService // Inyecta el servicio de correo
  ) {}

  ngOnInit() {
      // Suscribirse al estado de autenticación del usuario
      this.afAuth.authState.subscribe(user => {
        if (user) {
          this.user = user;
          const uid = user.uid;
    
          // Guardar el UID en el almacenamiento local si es necesario
          localStorage.setItem('uid', uid);
          console.log('ID Usuario Creador:', uid);
          console.log('Obteniendo correo del solicitante:', this.user.email);
          // Obtener el rol del usuario desde Firestore
          this.firestore.collection('users').doc(uid).get().subscribe((userDoc) => {
            const userData = userDoc.data() as Usuario;
            this.userRole = userData?.role || 'user'; // Asignar rol, por defecto 'user' si no hay rol definido
            console.log(`Rol del usuario cargado: ${this.userRole}`);
    
            // Ahora que el rol se ha cargado, llamar a obtenerPublicaciones
            this.obtenerTiposDeMascotas(); // Obtiene los tipos de mascotas
            this.obtenerPublicaciones(); // Obtiene todas las publicaciones
          });
        } else {
          console.warn('No se encontró un usuario autenticado.');
        }
      });
  }

  // Método para mostrar un toast en pantalla
async presentToast(message: string, duration: number = 2000) {
  const toast = await this.toastController.create({
    message: message,
    duration: duration, // Duración en milisegundos (por defecto 2000ms = 2 segundos)
    position: 'bottom', // Posición del mensaje (puede ser 'top', 'middle', o 'bottom')
    color: 'dark' // Puedes cambiar el color según tus preferencias ('primary', 'secondary', 'danger', etc.)
  });
  await toast.present();
}
  
  
  obtenerTiposDeMascotas() {
    this.firestore.collection('publicaciones').get().subscribe((snapshot) => {
      if (snapshot.empty) {
        console.log('No se encontraron publicaciones.');
        return;
      }
  
      const tiposSet = new Set<string>(); // Usamos un Set para obtener tipos únicos
  
      snapshot.forEach((doc) => {
        const data: any = doc.data();
        const tipo = data.mascota?.tipo;
  
        if (tipo) {
          tiposSet.add(tipo);
        } else {
          console.warn(`Documento sin campo 'tipo' en 'mascota':`, doc.id);
        }
      });
  
      this.tiposDeMascotas = ['Todos', ...Array.from(tiposSet)];
    }, (error) => {
      console.error('Error al obtener tipos de mascotas:', error);
    });
  }

  filtrarMascotas() {
    if (this.filtroTipoMascota === 'Todos') {
      this.obtenerPublicaciones(); // Muestra todas las mascotas si el filtro es "Todos"
    } else {
      // Consulta para obtener las mascotas del tipo seleccionado
      this.firestore.collection('publicaciones', ref => ref.where('mascota.tipo', '==', this.filtroTipoMascota))
        .get().subscribe(async (snapshot) => {
          const publicacionesFiltradas = snapshot.docs.map(doc => doc.data());
          // Mantener la lógica para cargar información de usuarios y centros
          const publicacionesConUsuarios = await this.cargarUsuariosYCentros(publicacionesFiltradas);
          this.publicaciones = publicacionesConUsuarios;
          console.log('Publicaciones filtradas:', this.publicaciones); // Verifica en la consola
        }, (error) => {
          console.error('Error al filtrar mascotas:', error);
        });
    }
  }

  async cargarUsuariosYCentros(publicaciones: any[]): Promise<any[]> {
    return await Promise.all(
      publicaciones.map(async (publicacion: any) => {
        console.log('ID Usuario Creador:', publicacion.idUsuarioCreador);
    
        const nombreUsuario = await this.obtenerNombreUsuario(publicacion.idUsuarioCreador);
    
        // Inicializar valores para el centro
        let nombreCentro = 'Nombre del centro no disponible';
        let direccionCentro = 'Dirección no disponible';
        let telefonoCentro = 'Teléfono no disponible';
    
        // Si hay un `centroId`, buscar la información del centro
        if (publicacion.centroId) {
          console.log('Buscando información para centroId:', publicacion.centroId);
          try {
            const centroDocRef = this.firestore.collection('centros_adopcion').doc(publicacion.centroId);
            const centroSnapshot = await centroDocRef.get().toPromise();
    
            if (centroSnapshot && centroSnapshot.exists) {
              const datosCentro = centroSnapshot.data() as {
                nombre: string;
                direccion: string;
                telefono: string;
              };
              console.log('Datos del centro obtenidos:', datosCentro);
    
              // Verificar y asignar datos del centro
              nombreCentro = datosCentro?.nombre || 'Nombre del centro no disponible';
              direccionCentro = datosCentro?.direccion || 'Dirección no disponible';
              telefonoCentro = datosCentro?.telefono || 'Teléfono no disponible';
            } else {
              console.warn(`Centro con ID ${publicacion.centroId} no encontrado.`);
            }
          } catch (error) {
            console.error('Error al obtener datos del centro:', error);
          }
        }
    
        return {
          ...publicacion,
          nombreUsuario,
          nombreDonante: publicacion.donante?.nombre || 'Donante desconocido',
          nombreMascota: publicacion.mascota?.nombre || 'Nombre desconocido',
          telefonoDonante: publicacion.donante?.numeroContacto || 'Teléfono no proporcionado',
          razaMascota: publicacion.mascota?.raza || 'Desconocida',
          edadMascota: publicacion.mascota?.edad || 'No disponible',
          tipoMascota: publicacion.mascota?.tipo || 'No especificado',
          estadoSaludMascota: publicacion.mascota?.estadoSalud || 'No disponible',
          descripcionMascota: publicacion.mascota?.descripcion || 'Sin descripción',
          sexoMascota: publicacion.mascota?.sexo || 'No especificado',
          personalidadMascota: publicacion.mascota?.personalidad?.join(', ') || 'Sin especificar',
          likes: publicacion.likes || [],
          // Agregar los datos del centro si están disponibles
          nombreCentro,
          direccionCentro,
          telefonoCentro,
        };
      })
    );
  }

  
  
  
  

  async obtenerNombreUsuario(idUsuario: string): Promise<string> {
    if (!idUsuario) {
      console.warn('ID de usuario no proporcionado.');
      return 'Usuario desconocido';
    }

    try {
      console.log('Obteniendo usuario con ID:', idUsuario);
      const docSnapshot = await firstValueFrom(
        this.firestore.collection('users').doc(idUsuario).get()
      );

      if (docSnapshot?.exists) {
        const data = docSnapshot.data() as Usuario;
        console.log('Datos del usuario:', data);
        return data?.name || 'Usuario sin nombre';
      } else {
        console.warn(`Usuario con ID ${idUsuario} no encontrado.`);
        return 'Usuario desconocido';
      }
    } catch (error) {
      console.error('Error al obtener el nombre del usuario:', error);
      return 'Error al obtener nombre';
    }
  }

  obtenerPublicaciones() {
    this.firestore
      .collection('publicaciones')
      .valueChanges({ idField: 'id' })
      .subscribe(async (publicaciones: any[]) => {
        console.log('Publicaciones obtenidas:', publicaciones);
  
        // Esperar a que se establezca el rol del usuario antes de filtrar
        if (!this.userRole) {
          console.warn('Rol del usuario no está definido. Esperando a que se cargue el rol...');
          return;
        }
  
        // Filtrar las publicaciones según el rol del usuario
        let publicacionesFiltradas = this.userRole === 'user'
          ? publicaciones.filter(pub => pub.mascota?.estado === 'Disponible') // Solo mostrar "Disponible" para usuarios comunes
          : publicaciones;
  
        // Aplicar filtro adicional por tipo de mascota si se ha seleccionado uno específico
        if (this.filtroTipoMascota !== 'Todos') {
          publicacionesFiltradas = publicacionesFiltradas.filter(pub => pub.mascota?.tipo === this.filtroTipoMascota);
        }
  
        const publicacionesConUsuarios = await Promise.all(
          publicacionesFiltradas.map(async (publicacion: any) => {
            console.log('ID Usuario Creador:', publicacion.idUsuarioCreador);
  
            const nombreUsuario = await this.obtenerNombreUsuario(publicacion.idUsuarioCreador);
  
            // Inicializar valores para el centro
            let nombreCentro = 'Nombre del centro no disponible';
            let direccionCentro = 'Dirección no disponible';
            let telefonoCentro = 'Teléfono no disponible';
  
            // Si hay un `centroId`, buscar la información del centro
            if (publicacion.centroId) {
              console.log('Buscando información para centroId:', publicacion.centroId);
              try {
                const centroDocRef = this.firestore.collection('centros_adopcion').doc(publicacion.centroId);
                const centroSnapshot = await centroDocRef.get().toPromise();
  
                if (centroSnapshot && centroSnapshot.exists) {
                  const datosCentro = centroSnapshot.data() as {
                    nombre: string;
                    direccion: string;
                    telefono: string;
                  };
                  console.log('Datos del centro obtenidos:', datosCentro);
  
                  // Verificar y asignar datos del centro
                  nombreCentro = datosCentro?.nombre || 'Nombre del centro no disponible';
                  direccionCentro = datosCentro?.direccion || 'Dirección no disponible';
                  telefonoCentro = datosCentro?.telefono || 'Teléfono no disponible';
                } else {
                  console.warn(`Centro con ID ${publicacion.centroId} no encontrado.`);
                }
              } catch (error) {
                console.error('Error al obtener datos del centro:', error);
              }
            }
  
            return {
              ...publicacion,
              nombreUsuario,
              nombreDonante: publicacion.donante?.nombre || 'Donante desconocido',
              nombreMascota: publicacion.mascota?.nombre || 'Nombre desconocido',
              telefonoDonante: publicacion.donante?.numeroContacto || 'Teléfono no proporcionado',
              razaMascota: publicacion.mascota?.raza || 'Desconocida',
              edadMascota: publicacion.mascota?.edad || 'No disponible',
              tipoMascota: publicacion.mascota?.tipo || 'No especificado',
              estadoSaludMascota: publicacion.mascota?.estadoSalud || 'No disponible',
              descripcionMascota: publicacion.mascota?.descripcion || 'Sin descripción',
              sexoMascota: publicacion.mascota?.sexo || 'No especificado',
              personalidadMascota: publicacion.mascota?.personalidad?.join(', ') || 'Sin especificar',
              likes: publicacion.likes || [],
              // Agregar los datos del centro si están disponibles
              nombreCentro,
              direccionCentro,
              telefonoCentro,
            };
          })
        );
  
        this.publicaciones = publicacionesConUsuarios;
        console.log('Publicaciones con usuarios:', this.publicaciones);
      });
  }
  
  
  toggleMeGusta(publicacion: { id: string; likes: string[] }) {
    const userId = this.user.uid;
    const likes = publicacion.likes || [];
  
    // Verificar que el ID de la publicación exista antes de intentar actualizarla
    if (!publicacion.id) {
      console.error('Error: No se encontró el ID de la publicación.');
      this.mostrarToast('Error: No se encontró el ID de la publicación.');
      return;
    }
  
    // Referencia al documento de Firestore
    const publicacionRef = this.firestore.collection('publicaciones').doc(publicacion.id);
  
    publicacionRef.get().subscribe((docSnapshot) => {
      if (!docSnapshot.exists) {
        console.error(`Error: No se encontró la publicación con ID ${publicacion.id}.`);
        this.mostrarToast('Error: La publicación no existe.');
        return;
      }
  
      if (likes.includes(userId)) {
        const newLikes = likes.filter(id => id !== userId);
        publicacionRef.update({ likes: newLikes })
          .then(() => this.mostrarToast('Has quitado "Me gusta" a la publicación'))
          .catch(error => console.error('Error al quitar "Me gusta":', error));
      } else {
        likes.push(userId);
        publicacionRef.update({ likes })
          .then(() => this.mostrarToast('Has dado "Me gusta" a la publicación'))
          .catch(error => console.error('Error al dar "Me gusta":', error));
      }
    }, error => {
      console.error('Error al verificar la existencia de la publicación:', error);
      this.mostrarToast('Error al verificar la existencia de la publicación.');
    });
  }
  
  
  ionViewWillEnter() {
    console.log('Tab2 se ha vuelto activa');
    this.cargarDatos();
  }

  cargarDatos() {
    console.log('Datos recargados en Tab2');
    // Aquí va la lógica para refrescar los datos en esta tab.
  }

  async mostrarToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  

  async mostrarInformacion(publicacion: any) {
    const userHasLiked = publicacion.likes.includes(this.user?.uid);
    const isAdopted = publicacion.mascota.estado === 'Adoptado'; // Verificar correctamente el estado
  
    const actionSheet = await this.actionSheetController.create({
      header: 'Ver Detalles de la Mascota',
      buttons: [
        {
          text: 'Ver Imagen Mascota',
          icon: 'image',
          handler: () => this.mostrarImagen(publicacion.imagenURL),
        },
        {
          text: 'Compartir',
          icon: 'share',
          handler: () => this.compartirPublicacion(publicacion), // Llamamos a la función de compartir
        },
        {
          text: userHasLiked ? 'Quitar "Me gusta"' : 'Dar "Me gusta"',
          icon: userHasLiked ? 'heart-dislike' : 'heart',
          handler: () => this.toggleMeGusta(publicacion),
        },
        {
          text: 'Solicitar adopción',
          icon: 'paw',
          handler: () => this.solicitarAdopcion(publicacion),
        },
        ...(this.userRole === 'admin' || this.user.uid === publicacion.idUsuarioCreador ? [{
          text: `Cambiar estado a ${isAdopted ? 'Disponible' : 'Adoptado'}`,
          icon: isAdopted ? 'checkmark-circle' : 'close-circle', // Iconos dinámicos basados en el estado
          handler: () => this.cambiarEstadoMascota(publicacion, isAdopted ? 'Disponible' : 'Adoptado'),
        }] : []),
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });
  
    await actionSheet.present();
  }
  
  async compartirPublicacion(publicacion: any) {
    // Asegúrate de que la URL es válida y accesible
    const shareData = {
      title: 'Publicación de Mascota',
      text: `¡Mira a ${publicacion.mascota.nombre}! ${publicacion.mascota.descripcion}`,
      url: publicacion.imagenURL || 'https://miaplicacion.com', // URL válida o predeterminada
    };
  
    // Verifica que la URL no sea una ruta local o nula
    if (!shareData.url || shareData.url.startsWith('http://localhost') || shareData.url.includes('capacitor_file')) {
      this.presentToast('No se puede compartir la imagen, URL no válida.', 3000);
      return;
    }
  
    // Intenta compartir usando Capacitor Share
    try {
      await Share.share({
        title: shareData.title,
        text: shareData.text,
        url: shareData.url,
        dialogTitle: 'Compartir Publicación',
      });
      this.presentToast('Compartido con éxito.', 2000);
    } catch (error) {
      console.error('Error al compartir:', error);
      this.presentToast('Hubo un problema al compartir la publicación.', 3000);
    }
  }
  
  
  async compartirPublicacionNativa(shareData: any) {
    try {
      await Share.share({
        title: shareData.title,
        text: shareData.text,
        url: shareData.url,  // Asegúrate de que esta URL es accesible públicamente
        dialogTitle: 'Compartir Publicación',
      });
      this.presentToast('Compartido con éxito.', 2000);
    } catch (error) {
      console.error('Error al compartir:', error);
      this.presentToast('Hubo un problema al compartir la publicación.', 3000);
    }
  }

  async cambiarEstadoMascota(publicacion: any, nuevoEstado: string) {
    try {
      // Actualizar el estado de la mascota en la base de datos (Firestore)
      await this.firestore.collection('publicaciones').doc(publicacion.id).update({
        'mascota.estado': nuevoEstado
      });
      publicacion.mascota.estado = nuevoEstado; // Actualizar localmente para reflejar el cambio
  
      this.mostrarToast(`Estado de la mascota cambiado a: ${nuevoEstado}`);
    } catch (error) {
      console.error('Error al cambiar el estado de la mascota:', error);
      this.mostrarToast('Error al cambiar el estado de la mascota.');
    }
  }
  
  async aceptarAnimalEnCentro(idMascota: string) {
    const centroId = localStorage.getItem('centroId'); // Supongamos que el ID del centro se guarda en el localStorage tras el login del centro
  
    if (!centroId) {
      console.error('ID del centro no encontrado.');
      return;
    }
  
    try {
      // Actualizar el centro para agregar el ID de la mascota aceptada
      await this.firestore.collection('centros_adopcion').doc(centroId).update({
        animalesAceptados: firebase.firestore.FieldValue.arrayUnion(idMascota),
      });
  
      // Actualizar la mascota para asignarle el centro
      await this.firestore.collection('publicaciones').doc(idMascota).update({
        centroIdAdoptante: centroId,
        estado: 'En refugio',
      });
  
      console.log('Animal aceptado por el centro correctamente.');
      this.mostrarToast('Animal aceptado en el centro.');
    } catch (error) {
      console.error('Error al aceptar el animal en el centro:', error);
      this.mostrarToast('Error al aceptar el animal en el centro.');
    }
  }

  async cambiarDisponibilidad(publicacion: any) {
  const alert = await this.alertController.create({
    header: 'Cambiar Disponibilidad',
    inputs: [
      {
        name: 'disponibilidad',
        type: 'radio',
        label: 'Disponible',
        value: 'Disponible',
        checked: publicacion.estado === 'Disponible',
      },
      {
        name: 'disponibilidad',
        type: 'radio',
        label: 'Adoptado',
        value: 'Adoptado',
        checked: publicacion.estado === 'Adoptado',
      },
      {
        name: 'disponibilidad',
        type: 'radio',
        label: 'En refugio',
        value: 'En refugio',
        checked: publicacion.estado === 'En refugio',
      },
    ],
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Guardar',
        handler: async (data) => {
          try {
            await this.firestore.collection('publicaciones').doc(publicacion.id).update({
              estado: data,
            });
            this.mostrarToast('Disponibilidad actualizada.');
          } catch (error) {
            console.error('Error al actualizar la disponibilidad:', error);
            this.mostrarToast('Error al actualizar la disponibilidad.');
          }
        },
      },
    ],
  });

  await alert.present();
}

  /*
  async cambiarDisponibilidad(publicacion: any) {
    const alert = await this.alertController.create({
      header: 'Cambiar Disponibilidad',
      inputs: [
        {
          name: 'disponibilidad',
          type: 'radio',
          label: 'Disponible',
          value: 'Disponible',
          checked: publicacion.estado === 'Disponible',
        },
        {
          name: 'disponibilidad',
          type: 'radio',
          label: 'Adoptado',
          value: 'Adoptado',
          checked: publicacion.estado === 'Adoptado',
        },
        {
          name: 'disponibilidad',
          type: 'radio',
          label: 'En refugio',
          value: 'En refugio',
          checked: publicacion.estado === 'En refugio',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            try {
              await this.firestore.collection('publicaciones').doc(publicacion.id).update({
                estado: data,
              });
              this.mostrarToast('Disponibilidad actualizada.');
            } catch (error) {
              console.error('Error al actualizar la disponibilidad:', error);
              this.mostrarToast('Error al actualizar la disponibilidad.');
            }
          },
        },
      ],
    });
  
    await alert.present();
  }
  */
  
  async mostrarImagen(imagenURL: string) {
    const modal = await this.modalController.create({
      component: ImageViewerModalPage,
      componentProps: { imagenURL }
    });
    await modal.present();
  }


  async solicitarAdopcion(publicacion: any) {
    if (!this.user) {
      this.mostrarToast('Debe iniciar sesión para solicitar adopción');
      return;
    }
  
    const modal = await this.modalController.create({
      component: FormularioAdopcionComponent,
    });
  
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned.data) {
        // Añadir la solicitud a Firestore
        this.firestore.collection('solicitudes_adopcion').add({
          idMascota: publicacion.id || 'ID desconocido',
          nombreMascota: publicacion.nombreMascota || 'Nombre desconocido',
          idUsuarioSolicitante: this.user.uid,
          nombreUsuarioSolicitante: this.user.email,
          nombreCompleto: dataReturned.data.nombreCompleto,
          telefono: dataReturned.data.telefono,
          tieneFamilia: dataReturned.data.tieneFamilia,  
          tieneHijos: dataReturned.data.tieneHijos,  
          direccion: dataReturned.data.direccion,
          motivoAdopcion: dataReturned.data.motivoAdopcion,
          identificacionURL: dataReturned.data.identificacionURL,
          fecha: new Date(),
          estado: 'Pendiente',
        }).then(() => {
          // Mostrar mensaje de éxito
          this.mostrarToast('Solicitud de adopción enviada con éxito');
          
          // Enviar notificación al dueño de la publicación
          this.enviarNotificacionAlDueno(publicacion, dataReturned.data);
        }).catch(error => console.error('Error al enviar solicitud de adopción:', error));
      }
    });
  
    return await modal.present(); 
  }

  async obtenerImagenURL(imagenPath: string): Promise<string> {
    const fileRef = this.storage.ref(imagenPath);
    return await fileRef.getDownloadURL().toPromise(); // Devuelve la URL pública
  }
  
  
  // Función para enviar notificación al dueño de la publicación
  enviarNotificacionAlDueno(publicacion: any, datosSolicitante: any) {
    // Obtener los datos del dueño de la publicación
    const idDueno = publicacion.idUsuarioCreador; // Usar el campo correcto para identificar al creador de la publicación
    console.log('Correo del dueño de la publicación:', publicacion.correo);
    
    if (!idDueno) {
      console.error('Error: No se pudo encontrar el ID del creador de la publicación.');
      this.mostrarToast('Error al enviar notificación: Falta el ID del creador de la publicación');
      return;
    }
  
    // Crear el mensaje de la notificación
    const mensaje = 
    `El usuario ${datosSolicitante.nombreCompleto || 'Desconocido'} ha solicitado adoptar a ${publicacion.nombreMascota || 'sin nombre'}.\n\n` +
    `Datos del solicitante:\n` +
    `Nombre: ${datosSolicitante.nombreCompleto || 'No especificado'}\n` +
    `Teléfono: ${datosSolicitante.telefono || 'No especificado'}\n` +
    `Correo electrónico: ${this.user.email || 'No especificado'}`;
  
    console.log('Obteniendo correo del solicitante:', this.user.email);

    // Crear la notificación a añadir
    const nuevaNotificacion = {
      fecha: new Date().toISOString(),
      leida: false,
      mensaje: mensaje
    };
  
    // Añadir la notificación al documento del usuario
    this.firestore.collection('users').doc(idDueno).update({
      notificaciones: arrayUnion(nuevaNotificacion) // Utilizar arrayUnion importado
    }).then(() => {
      console.log('Notificación guardada correctamente en el perfil del dueño de la publicación');
    }).catch(error => {
      console.error('Error al guardar la notificación en el perfil del dueño:', error);
    });

    const destinatario = publicacion.correo;
    const asunto = 'Solicitud de adopción para tu mascota ' + publicacion.mascota.nombre;
    const contenidoHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <h2 style="color: #1a73e8;">¡Hola!</h2>
        <p>Hemos recibido una nueva solicitud de adopción para tu mascota <strong>${publicacion.mascota.nombre}</strong>. A continuación, te presentamos los detalles del solicitante:</p>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Nombre del solicitante:</strong> ${datosSolicitante.nombreCompleto}</li>
          <li><strong>Correo electrónico:</strong> ${this.user.email || 'No especificado'}</li>
          <li><strong>Dirección de residencia:</strong> ${datosSolicitante.direccion || 'No especificado'}</li>
          <li><strong>Teléfono de contacto:</strong> ${datosSolicitante.telefono || 'No especificado'}</li>
          <li><strong>Tiene familia:</strong> ${datosSolicitante.tieneFamilia ? 'Sí' : 'No'}</li>
          <li><strong>Tiene hijos:</strong> ${datosSolicitante.tieneHijos ? 'Sí' : 'No'}</li>
        </ul>
        <p>El solicitante ha proporcionado un motivo para la adopción:</p>
        <blockquote style="border-left: 4px solid #1a73e8; padding-left: 10px; color: #555;">
          ${datosSolicitante.motivoAdopcion}
        </blockquote>
        <p>Puedes revisar esta solicitud accediendo a tu cuenta en nuestra aplicación móvil.</p>
        <p>Gracias por confiar en nosotros y por tu dedicación a brindar un hogar a estos animales.</p>
        <hr style="border: none; border-top: 1px solid #ddd;" />
        <footer style="font-size: 12px; color: #888;">
          <p>Este correo ha sido enviado automáticamente por <strong>Aplicación de Adopción de Mascotas</strong>. No respondas a este mensaje.</p>
          <p>© 2024 Aplicación Móvil. Todos los derechos reservados.</p>
        </footer>
      </div>
    `;
    
    this.emailService.sendEmail(destinatario, asunto, contenidoHtml).subscribe(
      (response) => {
        console.log('Correo enviado con éxito:', response);
      },
      (error) => {
        console.error('Error al enviar el correo:', error);
      }
    );
    
  }

  


  logout() {
    this.fireService.logout().then(() => console.log('Sesión cerrada'))
      .catch(error => console.error('Error al cerrar sesión', error));
  }
}

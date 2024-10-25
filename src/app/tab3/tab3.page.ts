import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { AuthService } from '../user-service/auth.service';
import { RegistrarCentroModalPage } from '../registrar-centro-modal/registrar-centro-modal.page';
import { ActualizarCentroModalComponent } from '../actualizar-centro-modal/actualizar-centro-modal.component';
import { ChangeDetectorRef } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { NavController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { take } from 'rxjs/operators';



@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
})
export class Tab3Page implements OnInit {
  usuario: any;
  notificaciones: any[] = [];
  contadorNotificaciones: number = 0;
  mostrarNotificaciones: boolean = false;
  centrosAdopcion: any[] = [];
  mostrarCentrosAdopcion: boolean = false; // Controla la visibilidad de la lista de centros
  userRole: string | null = null;
  userPhoto: string = '../../assets/icon/perfil_sin_foto.jpg'; // Imagen predeterminada

  

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private modalCtrl: ModalController,
    private cd: ChangeDetectorRef,
    private storage: AngularFireStorage,
    private navCtrl: NavController,
    private toastController: ToastController 
  ) {}

  ngOnInit() {
    this.obtenerUsuarioActual();
    this.obtenerCentrosAdopcion();
    this.userRole = localStorage.getItem('userRole');
    
  }

    // Método para mostrar un mensaje con el ToastController
    private async  presentToast(message: string) {
      const toast = await this.toastController.create({
        message: message,
        duration: 2000, // Duración de 2 segundos
        position: 'bottom', // Posición en la parte inferior de la pantalla
      });
      toast.present();
    }

      // Método para mostrar un mensaje con el ToastController
  async presentToasts(message: string, duration = 2000) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration, // Duración del mensaje
      position: 'bottom', // Mostrar en la parte inferior
    });
    toast.present();
  }

  navigateToPage() {
    this.navCtrl.navigateForward('/next-page');
  }

    // Función para verificar si es administrador
    isAdmin(): boolean {
      return this.userRole === 'admin';
    }
    

    // Función para obtener las notificaciones
obtenerNotificaciones() {
  if (!this.usuario?.uid) return; // Verifica que el usuario esté autenticado

  this.firestore.collection('notificaciones', ref => ref.where('idUsuarioDueno', '==', this.usuario.uid))
    .valueChanges({ idField: 'id' })
    .subscribe((notificaciones: any[]) => {
      this.notificaciones = notificaciones;
      this.actualizarContador(); // Actualiza el contador de notificaciones
    });
}

  // Método para abrir el input de selección de archivos
  selectImage() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLElement;
    fileInput.click(); // Abre el selector de archivos
  }

  async onAvatarClick() {
    const user = await this.afAuth.currentUser;
    if (user) {
      this.firestore.collection('users').doc(user.uid).valueChanges().pipe(take(1)).subscribe((userData: any) => {
        if (userData && userData.photoURL && userData.photoURL !== '../../assets/icon/perfil_sin_foto.jpg') {
          // Si hay una imagen de usuario personalizada, muestra la opción de eliminarla
          this.presentDeletePhotoAlert(user);
        } else {
          // Mostrar mensaje si no hay imagen personalizada
          this.presentToast('No hay imagen personalizada, no se puede eliminar');
        }
      });
    }
  }
  
  async presentDeletePhotoAlert(user: any) {
    const alert = await this.alertController.create({
      header: 'Eliminar Foto de Perfil',
      message: '¿Deseas eliminar tu foto de perfil actual?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            // Eliminar la foto de perfil y volver a la imagen predeterminada
            this.firestore.collection('users').doc(user.uid).update({
              photoURL: null // Actualiza el campo de Firestore a null para eliminar la imagen
            }).then(() => {
              this.userPhoto = '../../assets/icon/perfil_sin_foto.jpg'; // Establecer la imagen predeterminada
              this.presentToast('Foto de perfil eliminada');
            }).catch(error => {
              this.presentToast('Error al eliminar la foto de perfil.');
              console.error('Error al eliminar la foto en Firestore:', error);
            });
          }
        }
      ]
    });
    await alert.present();
  }
  
  
  ionViewWillEnter() {
    this.afAuth.currentUser.then(user => {
      if (user) {
        this.firestore.collection('users').doc(user.uid).valueChanges().subscribe((userData: any) => {
          if (userData && userData.photoURL) {
            this.userPhoto = userData.photoURL; // Mostrar la foto del usuario si existe
          } else {
            this.userPhoto = '../../assets/icon/perfil_sin_foto.jpg'; // Mostrar imagen predeterminada si no hay una foto personalizada
          }
        });
      }
    });
  }
  
  



  // Método para eliminar la foto de perfil
  eliminarFoto() {
    this.afAuth.currentUser.then(user => {
      if (user) {
        // Actualizar Firestore con la imagen predeterminada
        this.firestore.collection('users').doc(user.uid).update({
          photoURL: null // Se elimina la URL de la imagen de perfil en Firestore
        }).then(() => {
          this.userPhoto = '../../assets/icon/perfil_sin_foto.jpg'; // Establecer la imagen predeterminada
          console.log('Foto de perfil eliminada y reemplazada por la predeterminada');
        }).catch(error => {
          console.error('Error al eliminar la foto en Firestore:', error);
        });
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
  
    if (file && file.size <= 2 * 1024 * 1024) { // Limitar el tamaño del archivo a 2 MB
      this.afAuth.currentUser.then(user => {
        if (user) {
          const filePath = `profile_pictures/${user.uid}_${file.name}`; // Ruta del archivo en el almacenamiento
          const fileRef = this.storage.ref(filePath); // Referencia al archivo
          const task = this.storage.upload(filePath, file); // Carga del archivo
  
          task.snapshotChanges().pipe(
            finalize(() => {
              fileRef.getDownloadURL().subscribe(url => {
                this.userPhoto = url; // Asignar la nueva foto
                this.firestore.collection('users').doc(user.uid).update({
                  photoURL: url // Guardar la URL en Firestore
                }).then(() => {
                  // Mostrar un mensaje de éxito al usuario
                  this.presentToasts('Foto de perfil actualizada con éxito.');
  
                  // Agregar un pequeño retraso antes de la verificación de la foto
                  setTimeout(() => {
                    this.obtenerUsuarioActual(); // Refrescar los datos del usuario
                  }, 1000); // Esperar 1 segundo antes de actualizar la información
                });
              });
            })
          ).subscribe();
        } else {
          this.presentToasts('No se pudo obtener el usuario autenticado.');
        }
      });
    } else {
      // Mostrar un mensaje de error si el archivo excede el tamaño permitido
      this.presentToasts('El archivo excede el límite de 2 MB.', 3000);
    }
  }
  
  
    

    obtenerUsuarioActual() {
      this.afAuth.authState.subscribe((user) => {
        if (user) {
          this.firestore
            .collection('users')
            .doc(user.uid)
            .snapshotChanges() // Escucha cambios y da metadatos
            .subscribe((snapshot) => {
              const data = snapshot.payload.data();
              if (data) {
                this.usuario = data;
                this.notificaciones = this.usuario.notificaciones || [];
                this.actualizarContador();
              }
            });
        }
      });
    }
    

  actualizarContador() {
    this.contadorNotificaciones = this.notificaciones.filter(
      (notificacion) => !notificacion.leida
    ).length;
  }

  // Método para alternar la visibilidad de las notificaciones
  toggleNotificaciones() {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
    if (this.mostrarNotificaciones) {
      if (this.notificaciones.length === 0) {
        // Mostrar mensaje cuando no hay notificaciones
        this.presentToast('Actualmente no tiene notificaciones disponibles.');
      } else {
        this.marcarNotificacionesLeidas();
      }
    }
  }

  toggleCentrosAdopcion() {
    this.mostrarCentrosAdopcion = !this.mostrarCentrosAdopcion;
  }

  marcarNotificacionesLeidas() {
    const notificacionesActualizadas = this.notificaciones.map((notificacion) => ({
      ...notificacion,
      leida: true,
    }));
  
    if (this.usuario?.uid) {
      this.firestore
        .collection('users')
        .doc(this.usuario.uid)
        .update({ notificaciones: notificacionesActualizadas })
        .then(() => {
          this.notificaciones = notificacionesActualizadas;
          this.actualizarContador(); // Actualiza el contador de inmediato
        })
        .catch((error) => {
          console.error('Error al actualizar las notificaciones:', error);
        });
    }
  }
  

  async cambiarContrasena() {
    const alert = await this.alertController.create({
      header: 'Cambiar Contraseña',
      inputs: [
        { name: 'currentPassword', type: 'password', placeholder: 'Contraseña Actual' },
        { name: 'password', type: 'password', placeholder: 'Nueva Contraseña' },
        { name: 'confirmPassword', type: 'password', placeholder: 'Confirmar Contraseña' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cambiar',
          handler: (data) => {
            if (data.password !== data.confirmPassword) {
              this.mostrarError('Las contraseñas no coinciden');
            } else {
              this.authService.reautenticarUsuario(data.currentPassword) // Reautenticar primero
                .then(() => {
                  return this.authService.cambiarContrasena(data.password); // Cambiar la contraseña
                })
                .then(() => this.mostrarMensajeExito())
                .catch((error) => this.mostrarError('Error: ' + error.message));
            }
          },
        },
      ],
    });
  
    await alert.present();
  }
  

  async abrirModal() {
    const modal = await this.modalCtrl.create({
      component: RegistrarCentroModalPage,
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      this.firestore.collection('centros_adopcion').add(data).then(() => {
        console.log('Centro registrado exitosamente');
        this.obtenerCentrosAdopcion(); // Refresca la lista
      });
    }
  }

  obtenerCentrosAdopcion() {
    this.firestore
      .collection('centros_adopcion')
      .valueChanges({ idField: 'id' })
      .subscribe((centros) => {
        this.centrosAdopcion = centros;
      });
  }

  async ajustesGenerales() {
    const alert = await this.alertController.create({
      header: 'Ajustes Generales',
      inputs: [
        { name: 'tema', type: 'radio', label: 'Claro', value: 'light', checked: true },
        { name: 'tema', type: 'radio', label: 'Oscuro', value: 'dark' },
      ],
      buttons: [
        { text: 'Guardar', handler: (data) => console.log('Ajustes guardados: ', data) },
      ],
    });

    await alert.present();
  }

  async mostrarError(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async mostrarMensajeExito() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'Contraseña cambiada con éxito.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  async abrirModalActualizar(centro: any) {
    const modal = await this.modalCtrl.create({
      component: ActualizarCentroModalComponent,
      componentProps: {
        centro: centro, // Pasar los datos del centro al modal
      },
    });
  
    await modal.present();
  
    const { data } = await modal.onDidDismiss();
    if (data) {
      this.firestore
        .collection('centros_adopcion')
        .doc(centro.id)
        .update(data)
        .then(() => console.log('Centro actualizado exitosamente'))
        .catch((error) => console.error('Error al actualizar el centro:', error));
    }
  }



  cargarDatos() {
    console.log('Datos recargados en Tab3');
    // Aquí va la lógica para refrescar los datos en esta tab.
  }

  async eliminarCentro(centro: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar el centro "${centro.nombre}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Eliminación cancelada');
          },
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.procesarEliminacion(centro); // Llamar al método para procesar la eliminación
          },
        },
      ],
    });
  
    await alert.present();
  }
  
  procesarEliminacion(centro: any) {
    this.firestore
      .collection('centros_adopcion')
      .doc(centro.id) // Usa el ID del centro para eliminarlo
      .delete()
      .then(() => {
        console.log(`Centro eliminado: ${centro.nombre}`);
        this.obtenerCentrosAdopcion(); // Refresca la lista de centros
      })
      .catch((error) => {
        console.error('Error al eliminar el centro:', error);
      });
  }

  async confirmLogout() {
    const alert = await this.alertController.create({
      header: 'Confirmar Cierre de Sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          handler: () => {
            this.logout(); // Llama al método de logout
          },
        },
      ],
    });

    await alert.present();
  }

  async logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    const farewellAlert = await this.alertController.create({
      header: '¡Hasta pronto!',
      message: 'Esperamos verte de nuevo pronto.',
      buttons: ['OK'],
    });

    await farewellAlert.present();

    // Redirige al usuario al login después de que se cierre el mensaje
    farewellAlert.onDidDismiss().then(() => {
      this.router.navigate(['/login']);
    });
  }
  
  
}

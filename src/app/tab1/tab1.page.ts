import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../user-service/auth.service';
import { PhotoService } from '../services/photo.service'; // Asegúrate de importar esto
import { AngularFirestore } from '@angular/fire/compat/firestore'; // Asegúrate de usar el import correcto
import { AngularFireAuth } from '@angular/fire/compat/auth'; // Importa AngularFireAuth
import { ToastController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  imagenURL: string | undefined;
  mascotasRecientes: any[] = [];
  usuario: any = {}; // Variable para almacenar los datos del usuario



  constructor(
  private afAuth: AngularFireAuth, // Inyecta AngularFireAuth
    private navCtrl: NavController,
    private authService: AuthService,
    private router: Router,
    private photoService: PhotoService, // Inyecta el servicio de fotos
    private firestore: AngularFirestore, // Inyecta Firestore
    private toastController: ToastController // Inyecta 
  ) {}

  async seleccionarImagenDesdeGaleria() {
    const user = await this.afAuth.currentUser;
    if (user) {
      // Selecciona la imagen desde la galería usando PhotoService
      const imagenURL = await this.photoService.seleccionarImagenDesdeGaleria(user.uid);
      if (imagenURL) {
        // Navega a la página para llenar el formulario de la publicación
        this.router.navigate(['/tabs/llenar-informacion'], {
          state: { imagenURL }, // Pasa la URL de la imagen como estado
        });
        await this.presentToast('Imagen seleccionada correctamente.', 'success');
      } else {
        await this.presentToast('Error al seleccionar la imagen.', 'danger');
      }
    }
  }
  
  async tomarFoto() {
    const user = await this.afAuth.currentUser;
    if (user) {
      // Tomar foto usando PhotoService
      const imagenURL = await this.photoService.tomarFoto();
      if (imagenURL) {
        // Navega a la página para llenar el formulario de la publicación
        this.router.navigate(['/tabs/llenar-informacion'], {
          state: { imagenURL }, // Pasa la URL de la imagen como estado
        });
        await this.presentToast('Foto tomada correctamente.', 'success');
      } else {
        await this.presentToast('Error al tomar la foto.', 'danger');
      }
    }
  }



  async presentToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
    });
    toast.present();
  }

  ionViewWillEnter() {
    this.obtenerUsuarioActual();
    this.obtenerMascotasRecientes(); 
    console.log('Tab1 se ha vuelto activa');
    this.cargarDatos(); 

  const h = "";
}


  

  obtenerMascotasRecientes() {
    this.firestore
      .collection('publicaciones', (ref) => ref.orderBy('mascota.fechaCreacion', 'desc').limit(3))
      .snapshotChanges()
      .subscribe((data) => {
        this.mascotasRecientes = data.map((e) => {
          const publicacion = e.payload.doc.data() as any; // Asegúrate de que es 'any' o el tipo correcto
          const mascotaData = publicacion.mascota || {}; // Accedemos al subcampo 'mascota'
  
          // Convierte el Firestore Timestamp a un objeto Date
          
          const fechaCreacion = mascotaData.fechaCreacion
          ? (mascotaData.fechaCreacion.toDate ? mascotaData.fechaCreacion.toDate() : new Date(mascotaData.fechaCreacion))
          : null;

  
          return {
            id: e.payload.doc.id,
            nombre: mascotaData.nombre || 'Sin nombre',
            edad: mascotaData.edad || 'Desconocida',
            raza: mascotaData.raza || 'Desconocida',
            descripcion: mascotaData.descripcion || 'No hay descripción',
            estado: mascotaData.estado || 'No especificado',
            estadoSalud: mascotaData.estadoSalud || 'No especificado',
            personalidad: mascotaData.personalidad || [],
            imagenURL: publicacion.imagenURL || 'assets/img/default-pet.jpg', // Imagen desde el campo 'imagenURL'
            fechaCreacion // Se utiliza el objeto Date convertido
          };
        });
      });
  }


    // Método para obtener el usuario actual y escuchar cambios
    obtenerUsuarioActual() {
      this.afAuth.authState.subscribe((user) => {
        if (user) {
          this.firestore
            .collection('users')
            .doc(user.uid)
            .snapshotChanges() // Escucha los cambios en el documento del usuario
            .subscribe((snapshot) => {
              const data = snapshot.payload.data(); // Obtiene los datos del documento
              if (data) {
                this.usuario = data;
                console.log('Usuario actual:', this.usuario);
              }
            });
        } else {
          console.log('No hay usuario autenticado.');
        }
      });
    }
  
  
  

  cargarDatos() {
    console.log('Datos recargados en Tab1');
    this.obtenerMascotasRecientes(); // Llama a la función para obtener mascotas recientes
    
  }

  logout() {
    // Función de cierre de sesión
    this.authService
      .logout()
      .then(() => {
        this.router.navigate(['/login']);
      })
      .catch((error) => {
        console.error('Error al cerrar sesión', error);
      });
  }
}

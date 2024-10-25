import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ToastController } from '@ionic/angular';
import { FireserviceService } from '../fireservice.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { EmailService } from '../services/email.service';
import { Timestamp } from 'firebase/firestore';
import { AuthService } from '../user-service/auth.service';
import { PhotoService } from '../services/photo.service';
@Component({
  selector: 'app-llenar-informacion',
  templateUrl: './llenar-informacion.page.html',
  styleUrls: ['./llenar-informacion.page.scss'],
})
export class LlenarInformacionPage {
  imagenURL: string | undefined;
  documentoURL: string | undefined;
  usuarioLogueado: any;

  nombreMascota: string = '';
  razaMascota: string = '';
  edadMascota: number | null = null;
  sexoMascota: string = '';
  personalidadMascota: string[] = [];
  descripcionMascota: string = '';
  tipoMascota: string = '';
  estadoSaludMascota: string = '';
  ubicacionMascota: string = 'particular';
  nombreDonante: string = '';
  numeroDonante: string = '';
  direccionDonante: string = '';
  centrosAdopcion: any[] = []; // Inicializa la lista de centros
  centroId: string = ''; // ID del centro de adopción seleccionado
  publicaciones: any[] = [];
  user: any;
  


  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private storage: AngularFireStorage,
    private firestore: AngularFirestore,
    private toastController: ToastController,
    private fireService: FireserviceService,
    private afAuth: AngularFireAuth,
    private authService: AuthService,
    private photoService: PhotoService
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state) {
      this.imagenURL = state['imagenURL'];
    }

    this.fireService.getUsuarioLogueado().then((user) => {
      this.usuarioLogueado = user;
    });
  }

  ngOnInit() {
    this.cargarCentrosAdopcion();
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.user = user;
        console.log('Usuario autenticado:', this.user);
      } else {
        console.warn('No se encontró un usuario autenticado.');
      }
    });
  }

// Subir la imagen antes de crear la publicación
async cargarImagen() {
  try {
    const user = await this.afAuth.currentUser; // Obtener el usuario actual desde AngularFireAuth
    if (user) {
      // Selecciona la imagen desde la galería usando PhotoService
      this.imagenURL = await this.photoService.seleccionarImagenDesdeGaleria(user.uid);
    }

    if (this.imagenURL) {
      this.mostrarToast('Imagen subida correctamente.');
    } else {
      this.mostrarToast('Error al subir la imagen.');
    }
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    this.mostrarToast('Error al subir la imagen.');
  }
}





  async cargarDocumento(event: any) {
    const file = event.target.files[0];
    if (file && file.size <= 1 * 1024 * 1024) {
      const filePath = `documentos/${Date.now()}_${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = await fileRef.put(file);

      this.documentoURL = await task.ref.getDownloadURL();
      console.log('Documento subido: ', this.documentoURL);
      this.mostrarToast('Documento subido correctamente');
    } else {
      this.mostrarToast('El archivo debe ser menor a 1 MB');
    }
  }

  async obtenerInformacionCentro(centroId: string) {
    try {
      console.log('Buscando información para centroId:', centroId);
      const centroSnapshot = await this.firestore
        .collection('centros_adopcion')
        .doc(centroId) // Utiliza centroId directamente como parámetro
        .get()
        .toPromise();
  
      if (centroSnapshot && centroSnapshot.exists) {
        const datosCentro = centroSnapshot.data() as {
          nombre: string;
          direccion: string;
          telefono: string;
        };
        console.log('Datos del centro encontrados:', datosCentro);
        return datosCentro;
      } else {
        console.warn(`Centro con ID ${centroId} no encontrado.`);
        return null;
      }
    } catch (error) {
      console.error('Error al obtener datos del centro:', error);
      return null;
    }
  }

// Función para obtener el nombre del usuario autenticado por UID
async obtenerNombreUsuario(uid: string): Promise<string> {
  try {
    // Obtener el documento del usuario con el UID
    const userDoc = await this.firestore.collection('users').doc(uid).get().toPromise();
    
    // Verificar que el documento no sea undefined y que exista
    if (userDoc && userDoc.exists) {
      const userData = userDoc.data() as { name: string };
      return userData?.name || 'Usuario desconocido';
    } else {
      console.warn(`Usuario con UID ${uid} no encontrado.`);
    }
  } catch (error) {
    console.error('Error al obtener el nombre del usuario:', error);
  }
  
  return 'Usuario desconocido';
}

  
  async crearPublicacion() {
    console.log('Tipo de Mascota:', this.tipoMascota);
    console.log('Estado Salud:', this.estadoSaludMascota);
  
    // Validar los campos obligatorios de tipo de mascota y estado de salud
    if (!this.tipoMascota || !this.estadoSaludMascota) {
      this.mostrarToast('Por favor, seleccione el tipo de mascota y el estado de salud.');
      return;
    }
  
    // Validar información del donante si es un donante particular
    if (this.ubicacionMascota === 'particular') {
      if (!this.nombreDonante || !this.numeroDonante || !this.direccionDonante) {
        this.mostrarToast('Por favor, complete la información del donante.');
        return;
      }
  
      // Validar documento obligatorio solo para donantes particulares
      if (!this.documentoURL) {
        this.mostrarToast('Por favor, sube un documento de identificación.');
        return;
      }
    }
  
    let datosCentro = {
      nombre: 'Nombre del centro no disponible',
      direccion: 'Dirección no disponible',
      telefono: 'Teléfono no disponible',
      correo: 'Correo no disponible',
    };
  
    // Obtener datos del centro si se ha seleccionado uno
    if (this.centroId) {
      try {
        console.log('Buscando información para centroId:', this.centroId);
        const centroSnapshot = await this.firestore
          .collection('centros_adopcion')
          .doc(this.centroId)
          .get()
          .toPromise();
  
        if (centroSnapshot && centroSnapshot.exists) {
          datosCentro = centroSnapshot.data() as {
            nombre: string;
            direccion: string;
            telefono: string;
            correo: string;
          };
        } else {
          console.warn(`Centro con ID ${this.centroId} no encontrado.`);
        }
      } catch (error) {
        console.error('Error al obtener datos del centro:', error);
      }
    }
  
    // Verificar si hay un usuario autenticado
    if (!this.user || !this.user.uid) {
      console.error('No se ha encontrado un usuario autenticado.');
      this.mostrarToast('Error al crear la publicación. Usuario no autenticado.');
      return;
    }
  
    // Crear un ID personalizado para la publicación
    const idPublicacion = this.firestore.createId();
      // Obtener el nombre del usuario autenticado
    const nombreUsuario = await this.obtenerNombreUsuario(this.user.uid);
  
    // Construir el objeto de publicación
    const publicacionData = {
      idUsuarioCreador: this.user.uid, // Agregar el UID del usuario autenticado
      nombreUsuarioCreador: nombreUsuario,

      centroId: this.centroId || null, // Asignar el ID del centro si existe
      nombreCentro: datosCentro.nombre,
      correoCentro: datosCentro.correo,
      direccionCentro: datosCentro.direccion,
      telefonoCentro: datosCentro.telefono,
      tipoDonante: this.ubicacionMascota, // Almacenar el tipo de donante (centro o particular)
      mascota: {
        fechaCreacion: Timestamp.fromDate(new Date()),
        //fechaCreacion: new Date(),
        nombre: this.nombreMascota,
        raza: this.razaMascota,
        edad: this.edadMascota,
        sexo: this.sexoMascota,
        personalidad: this.personalidadMascota,
        descripcion: this.descripcionMascota,
        tipo: this.tipoMascota,
        estadoSalud: this.estadoSaludMascota,
        estado: "Disponible" // Estado de la mascota por defecto
      },
      donante: {
        nombre: this.ubicacionMascota === 'particular' ? this.nombreDonante : null,
        numeroContacto: this.ubicacionMascota === 'particular' ? this.numeroDonante : null,
        direccion: this.ubicacionMascota === 'particular' ? this.direccionDonante : null,
      },
      documentoURL: this.ubicacionMascota === 'particular' ? this.documentoURL : null,
      imagenURL: this.imagenURL,
      correo: this.user.email, // Usar correo del usuario autenticado
    };
  
    // Intentar crear la publicación en Firestore con un ID personalizado
    try {
      await this.firestore.collection('publicaciones').doc(idPublicacion).set(publicacionData);
      this.mostrarToast('Publicación creada exitosamente');
      this.limpiarFormulario();
      this.router.navigate(['tabs/tab1']).then(() => {
        location.reload(); // Forzar la recarga completa de la página
    });
    } catch (error) {
      console.error('Error al crear la publicación: ', error);
      this.mostrarToast('Error al crear la publicación');
    }
  }
  

  


  limpiarFormulario() {
    this.tipoMascota = ''; // Si tipoMascota es de tipo string
    this.estadoSaludMascota = ''; // Si estadoSaludMascota es de tipo string
    this.ubicacionMascota = ''; // Si ubicación es de tipo string
    this.nombreDonante = ''; // Si nombreDonante es de tipo string
    this.numeroDonante = ''; // Si numeroDonante es de tipo string
    this.direccionDonante = ''; // Si direccionDonante es de tipo string
    this.documentoURL = ''; // Si documentoURL es de tipo string
    this.centroId = ''; // Si centroId es de tipo string
    this.nombreMascota = ''; // Si nombreMascota es de tipo string
    this.razaMascota = ''; // Si razaMascota es de tipo string
    this.edadMascota = 0; // Si edadMascota es de tipo número
    this.sexoMascota = ''; // Si sexoMascota es de tipo string
    this.personalidadMascota = []; // Si personalidadMascota es un array
    this.descripcionMascota = ''; // Si descripcionMascota es de tipo string
    this.imagenURL = ''; // Si imagenURL es de tipo string
  }
  

  
  
  
  cargarCentrosAdopcion() {
    this.firestore.collection('centros_adopcion').valueChanges({ idField: 'id' }).subscribe((centros: any[]) => {
      if (centros) {
        this.centrosAdopcion = centros.map(centro => ({
          id: centro.id,
          nombre: centro.nombre,
          direccion: centro.direccion,
          telefono: centro.telefono
        }));
        console.log('Centros de adopción cargados:', this.centrosAdopcion);
      } else {
        console.warn('No se encontraron centros de adopción.');
      }
    }, error => {
      console.error('Error al cargar los centros de adopción:', error);
    });
  }


  
  
  onUbicacionChange() {
    if (this.ubicacionMascota === 'centro') {
      this.nombreDonante = '';
      this.numeroDonante = '';
      this.direccionDonante = '';
    }
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }
}

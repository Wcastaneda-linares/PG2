import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-update-publicacion-modal',
  templateUrl: './update-publicacion-modal.component.html',
  styleUrls: ['./update-publicacion-modal.component.scss'],
})
export class UpdatePublicacionModalComponent implements OnInit {
  @Input() publicacion: any; // Recibe la publicación desde el modal
  archivoDocumento: File | null = null;
  tipoDonante: string = ''; // Agrega la propiedad tipoDonante

  constructor(
    private modalCtrl: ModalController,
    private firestore: AngularFirestore
  ) {}

  ngOnInit() {
    console.log('Datos recibidos en el modal:', this.publicacion);

    if (!this.publicacion.mascota) this.publicacion.mascota = {};
    if (!this.publicacion.donante) this.publicacion.donante = {};

    // Asignar el tipo de donante según la existencia de centroId
    if (this.publicacion.centroId && this.publicacion.centroId !== '') {
      this.tipoDonante = 'centro';
      this.cargarDatosCentro(); // Cargar los datos del centro
    } else {
      this.tipoDonante = 'particular';
    }
  }

  cargarDatosCentro() {
    if (this.publicacion.centroId) {
      this.firestore.collection('centros_adopcion').doc(this.publicacion.centroId).get().subscribe((docSnapshot) => {
        if (docSnapshot.exists) {
          const datosCentro = docSnapshot.data() as {
            nombre: string;
            direccion: string;
            telefono: string;
          };
          // Asignar los datos del centro al donante
          this.publicacion.donante = {
            nombre: datosCentro.nombre,
            direccion: datosCentro.direccion,
            numeroContacto: datosCentro.telefono,
          };
        }
      });
    }
  }

  esImagen(url: string): boolean {
    return /\.(jpg|jpeg|png|gif)$/i.test(url);
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  cargarDocumento(event: any) {
    const file = event.target.files[0];
    if (file.size <= 1048576) {
      this.archivoDocumento = file;
    } else {
      alert('El archivo no debe superar 1 MB.');
    }
  }

  guardarCambios() {
    // Crear un objeto que solo contenga la información de la mascota
    const actualizacionMascota = {
      mascota: {
        ...this.publicacion.mascota, // Copiar toda la información de la mascota
      }
    };
  
    // Cerrar el modal y devolver solo la información de la mascota actualizada
    this.modalCtrl.dismiss(actualizacionMascota);
  }
  

}

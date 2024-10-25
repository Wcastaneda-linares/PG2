import { Component } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-registrar-centro-modal',
  templateUrl: './registrar-centro-modal.page.html',
  styleUrls: ['./registrar-centro-modal.page.scss'],
})
export class RegistrarCentroModalPage {
  nombreCentro: string = '';
  direccionCentro: string = '';
  telefonoCentro: string = '';
  correoCentro: string = '';

  tipoCentro: string[] = [];
  servicios: string[] = [];
  horarioAtencion: string = '';
  observaciones: string = '';

  opcionesTipoCentro = ['Refugio', 'Clínica', 'Temporal', 'Educativo'];
  opcionesServicios = ['Adopción', 'Esterilización', 'Vacunación', 'Consulta Veterinaria'];

  constructor(
    private modalCtrl: ModalController,
    private firestore: AngularFirestore,
    private alertController: AlertController
  ) {}

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  async registrarCentro() {
    // Validar que todos los campos obligatorios estén completos
    if (
      !this.nombreCentro ||
      !this.direccionCentro ||
      !this.telefonoCentro ||
      !this.horarioAtencion ||
      this.tipoCentro.length === 0 ||
      this.servicios.length === 0
    ) {
      this.mostrarAlerta('Error', 'Por favor, completa todos los campos.');
      return;
    }

      // Generar un nuevo ID de documento para el centro de adopción
  const centroId = this.firestore.createId(); // Crear un nuevo ID único

    const data = {
      centroId: centroId, // Almacenar el ID generado
      nombre: this.nombreCentro,
      direccion: this.direccionCentro,
      telefono: this.telefonoCentro,
      correo: this.correoCentro,
      tipoCentro: [...this.tipoCentro], // Asegura que sea un array
      servicios: [...this.servicios],   // Asegura que sea un array
      horarioAtencion: this.horarioAtencion,
      observaciones: this.observaciones,
    };

    try {
      await this.firestore.collection('centros_adopcion').add(data);
      console.log('Centro registrado exitosamente');
      this.cerrarModal();
    } catch (error) {
      console.error('Error al registrar el centro:', error);
      this.mostrarAlerta('Error', 'Hubo un error al registrar el centro.');
    }
  }

  toggleCheckbox(array: string[], value: string) {
    const index = array.indexOf(value);
    if (index === -1) {
      array.push(value); // Agrega el valor si no existe
    } else {
      array.splice(index, 1); // Elimina el valor si ya existe
    }
  }

  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}

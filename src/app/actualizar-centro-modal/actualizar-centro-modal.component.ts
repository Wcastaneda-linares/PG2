import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-actualizar-centro-modal',
  templateUrl: './actualizar-centro-modal.component.html',
  styleUrls: ['./actualizar-centro-modal.component.scss'],
})
export class ActualizarCentroModalComponent implements OnInit {
  @Input() centro: any; // Recibe los datos del centro desde el componente padre

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

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.cargarDatosCentro();
  }

  cargarDatosCentro() {
    if (this.centro) {
      this.nombreCentro = this.centro.nombre || '';
      this.direccionCentro = this.centro.direccion || '';
      this.telefonoCentro = this.centro.telefono || '';
      this.correoCentro = this.centro.correo || '';
      this.tipoCentro = [...(this.centro.tipoCentro || [])]; // Clonamos el array
      this.servicios = [...(this.centro.servicios || [])]; // Clonamos el array
      this.horarioAtencion = this.centro.horarioAtencion || '';
      this.observaciones = this.centro.observaciones || '';
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  actualizarCentro() {
    const data = {
      nombre: this.nombreCentro,
      direccion: this.direccionCentro,
      telefono: this.telefonoCentro,
      correo: this.correoCentro,
      tipoCentro: this.tipoCentro,
      servicios: this.servicios,
      horarioAtencion: this.horarioAtencion,
      observaciones: this.observaciones,
    };

    this.modalCtrl.dismiss(data);
  }

  toggleCheckbox(array: string[], value: string) {
    const index = array.indexOf(value);
    if (index === -1) {
      array.push(value);
    } else {
      array.splice(index, 1);
    }
  }

  isChecked(array: string[], value: string): boolean {
    return array.includes(value);
  }
}

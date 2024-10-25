import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-informacion-modal',
  templateUrl: './informacion-modal.page.html',
  styleUrls: ['./informacion-modal.page.scss'],
})
export class InformacionModalPage {
  @Input() publicacion: any;

  constructor(private modalController: ModalController) {}

  cerrarModal() {
    this.modalController.dismiss();
  }
}

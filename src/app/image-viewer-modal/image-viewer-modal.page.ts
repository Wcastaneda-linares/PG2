import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-image-viewer-modal',
  templateUrl: './image-viewer-modal.page.html',
  styleUrls: ['./image-viewer-modal.page.scss'],
})
export class ImageViewerModalPage implements OnInit {
  imagenURL: string = '';

  constructor(
    private modalController: ModalController,
    private navParams: NavParams
  ) {}

  ngOnInit() {
    this.imagenURL = this.navParams.get('imagenURL');
  }

  cerrarModal() {
    this.modalController.dismiss();
  }
}

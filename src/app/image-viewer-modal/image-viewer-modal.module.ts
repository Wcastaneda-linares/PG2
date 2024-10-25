import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ImageViewerModalPageRoutingModule } from './image-viewer-modal-routing.module';

import { ImageViewerModalPage } from './image-viewer-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ImageViewerModalPageRoutingModule
  ],
  declarations: [ImageViewerModalPage]
})
export class ImageViewerModalPageModule {}

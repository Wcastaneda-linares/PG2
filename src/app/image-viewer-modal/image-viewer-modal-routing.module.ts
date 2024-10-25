import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ImageViewerModalPage } from './image-viewer-modal.page';

const routes: Routes = [
  {
    path: '',
    component: ImageViewerModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImageViewerModalPageRoutingModule {}

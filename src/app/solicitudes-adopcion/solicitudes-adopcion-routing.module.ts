import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SolicitudesAdopcionPage } from './solicitudes-adopcion.page';

const routes: Routes = [
  {
    path: '',
    component: SolicitudesAdopcionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SolicitudesAdopcionPageRoutingModule {}

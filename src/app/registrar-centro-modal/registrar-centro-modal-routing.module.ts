import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistrarCentroModalPage } from './registrar-centro-modal.page';

const routes: Routes = [
  {
    path: '',
    component: RegistrarCentroModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrarCentroModalPageRoutingModule {}

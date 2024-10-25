import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LlenarInformacionPage } from './llenar-informacion.page';

const routes: Routes = [
  {
    path: '',
    component: LlenarInformacionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LlenarInformacionPageRoutingModule {}

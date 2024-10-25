import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InformacionModalPage } from './informacion-modal.page';

const routes: Routes = [
  {
    path: '',
    component: InformacionModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InformacionModalPageRoutingModule {}

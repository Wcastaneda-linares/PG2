import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserService } from './user-service.page';

const routes: Routes = [
  {
    path: '',
    component: UserService,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserServicePageRoutingModule {}

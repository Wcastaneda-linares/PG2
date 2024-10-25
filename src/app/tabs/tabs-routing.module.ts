import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { AuthGuard } from '../user-service/auth.guard'; // Asegúrate de que la ruta sea correcta
import { AdminRoleGuard } from '../guards/admin-role.guard'; // Importa el guard para el rol de admin

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadChildren: () =>
          import('../tab1/tab1.module').then((m) => m.Tab1PageModule),
        canActivate: [AuthGuard], // Protección con AuthGuard
      },
      {
        path: 'tab2',
        loadChildren: () =>
          import('../tab2/tab2.module').then((m) => m.Tab2PageModule),
        canActivate: [AuthGuard], // Protección con AuthGuard
      },
      {
        path: 'tab3',
        loadChildren: () =>
          import('../tab3/tab3.module').then((m) => m.Tab3PageModule),
        canActivate: [AuthGuard], // Protección con AuthGuard
      },
      {
        path: 'tab4',
        loadChildren: () =>
          import('../tab4/tab4.module').then((m) => m.Tab4PageModule),
        canActivate: [AuthGuard, AdminRoleGuard], // Protección con ambos guards
      },
      {
        path: 'llenar-informacion', // Ruta del formulario
        loadChildren: () =>
          import('../llenar-informacion/llenar-informacion.module').then(
            (m) => m.LlenarInformacionPageModule
          ),
        canActivate: [AuthGuard], // Protección con AuthGuard
      },
      {
        path: 'chat',
        loadChildren: () =>
          import('../chat/chat.module').then((m) => m.ChatPageModule),
        canActivate: [AuthGuard], // Protección con AuthGuard
      },
      {
        path: '',
        redirectTo: 'tab1',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}

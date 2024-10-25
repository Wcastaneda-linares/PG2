import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './user-service/auth.guard'; // Asegúrate de que la ruta esté correcta.
import { AdminRoleGuard } from './guards/admin-role.guard';
import { PreloadAllModules } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then(m => m.LoginPageModule),
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then(m => m.HomePageModule),
  },
  {
    path: 'signup',
    loadChildren: () =>
      import('./signup/signup.module').then(m => m.SignupPageModule),
  },
  {
    path: 'llenar-informacion',
    loadChildren: () =>
      import('./llenar-informacion/llenar-informacion.module').then(m => m.LlenarInformacionPageModule),
  },
  {
    path: 'informacion-modal',
    loadChildren: () =>
      import('./informacion-modal/informacion-modal.module').then(m => m.InformacionModalPageModule),
  },
  {
    path: 'image-viewer-modal',
    loadChildren: () =>
      import('./image-viewer-modal/image-viewer-modal.module').then(m => m.ImageViewerModalPageModule),
  },
  {
    path: 'chat',
    loadChildren: () =>
      import('./chat/chat.module').then(m => m.ChatPageModule),
  },
  {
    path: 'tab4',
    loadChildren: () =>
      import('./tab4/tab4.module').then(m => m.Tab4PageModule),
    canActivate: [AuthGuard, AdminRoleGuard], // Protegido por ambos guards
  },
  {
    path: 'solicitudes-adopcion',
    loadChildren: () =>
      import('./solicitudes-adopcion/solicitudes-adopcion.module').then(m => m.SolicitudesAdopcionPageModule),
  },
  {
    path: 'tabs',
    loadChildren: () =>
      import('./tabs/tabs.module').then(m => m.TabsPageModule),
  },
  {
    path: 'user-service',
    loadChildren: () =>
      import('./user-service/user-service.module').then(m => m.UserServicePageModule),
  },
  {
    path: 'registrar-centro-modal',
    loadChildren: () =>
      import('./registrar-centro-modal/registrar-centro-modal.module').then(m => m.RegistrarCentroModalPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}

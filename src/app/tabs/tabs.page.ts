import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage implements OnInit, OnDestroy {
  userRole: string | null = null;
  contadorNotificaciones: number = 0;
  authSubscription!: Subscription; // Suscripción para cambios de sesión

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.subscribeToAuthState();
    this.listenForNavigationChanges();
    this.obtenerNotificaciones();
  }

  ionViewWillEnter() {
    // Este método se ejecuta cada vez que el usuario accede a esta pestaña.
    console.log('Tab1 se ha vuelto activa');
    this.cargarDatos(); // Llama a la función que carga datos o refresca la vista
  }

  cargarDatos() {
    // Implementa aquí la lógica que necesites para actualizar los datos.
    console.log('Datos recargados en Tab1');
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe(); // Evitar fugas de memoria
    }
  }

  // Escuchar cambios en el estado de autenticación
  private subscribeToAuthState() {
    this.authSubscription = this.afAuth.authState.subscribe((user) => {
      if (user) {
        // Si el usuario está autenticado, obtiene su rol desde Firestore
        this.firestore
          .collection('users')
          .doc(user.uid)
          .valueChanges()
          .subscribe((usuario: any) => {
            this.userRole = usuario?.role || 'user';
            this.cd.detectChanges(); // Forzar actualización de la vista
          });
      } else {
        // Si no hay usuario autenticado, redirigir al login
        this.router.navigateByUrl('/login');
      }
    });
  }

  // Escuchar cambios de navegación para actualizar notificaciones en tab3
  private listenForNavigationChanges() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/tabs/tab3') {
          this.obtenerNotificaciones(); // Actualiza notificaciones
        }
      });
  }

  obtenerNotificaciones() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.firestore
          .collection('users')
          .doc(user.uid)
          .valueChanges()
          .subscribe((usuario: any) => {
            if (usuario?.notificaciones) {
              this.contadorNotificaciones = usuario.notificaciones.filter(
                (notificacion: any) => !notificacion.leida
              ).length;
              this.cd.detectChanges();
            }
          });
      }
    });
  }

  // Verificar si es administrador
  isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  logout() {
    this.afAuth.signOut().then(() => {
      localStorage.removeItem('authToken'); // Elimina el token
      localStorage.removeItem('userRole'); // Elimina el rol
      this.router.navigateByUrl('/login'); // Redirige al login
    });
  }
}

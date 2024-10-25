interface Mensaje {
  contenido: string;
  respuestas: { contenido: string; timestamp: string; usuario: string }[];
  timestamp: string;
  usuario: string;
}

import { ModalController, PopoverController, AlertController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FireserviceService } from '../fireservice.service';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';
import { UpdatePublicacionModalComponent } from '../update-publicacion-modal/update-publicacion-modal.component'; 
import { PopoverComponent } from '../popover/popover.component';
import { jsPDF } from 'jspdf';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import { AngularFireAuth } from '@angular/fire/compat/auth'; 
import { SolicitudesModalComponent } from '../solicitudes-modal/solicitudes-modal.component'; // Importa el modal
import { ApexOptions } from 'ng-apexcharts';
import { Filesystem, Directory, Encoding  } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular'; 
import { ToastController } from '@ionic/angular'; // Importa ToastController
import { saveAs } from 'file-saver';

import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexTitleSubtitle,
  ApexLegend,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  title: ApexTitleSubtitle;
  labels: string[];
  legend: ApexLegend;
};


@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  chartOptionsMensajes: Partial<ApexOptions> = {};
  chartOptionsServicios: Partial<any> | any;
  centrosData: { nombre: string, cantidadServicios: number, servicios: string[] }[] = [];
  @ViewChild('chartRef', { static: false }) chartRef!: ElementRef;
  @ViewChild('chartRefMensajes', { static: false }) chartRefMensajes!: ElementRef;

  // Propiedades para los gráficos
chartOptionsTipoAnimal: Partial<ApexOptions> = {};
chartOptionsEstadoSalud: Partial<ApexOptions> = {};
chartOptionsEstadoAdopcion: Partial<ApexOptions> = {};
chartOptionsTipoDonante: Partial<ApexOptions> = {};
chartOptionsAnimalesPorCentro: Partial<ApexOptions> = {};
chartOptionsEstadoSolicitudes: Partial<ApexOptions> = {};


// Propiedades para los conteos
conteoTiposAnimales: Array<{ nombre: string, cantidad: number }> = [];
conteoEstadoSalud: Array<{ nombre: string, cantidad: number }> = [];
conteoEstadoAdopcion: Array<{ nombre: string, cantidad: number }> = [];
conteoTipoDonante: Array<{ nombre: string, cantidad: number }> = [];
conteoAnimalesPorCentro: Array<{ nombre: string, cantidad: number }> = [];
chartOptionsRolesUsuarios: Partial<ApexOptions> = {};


  
  public chartOptions: Partial<ChartOptions> | any = {
    series: [],
    chart: {
      type: 'pie', // Puedes cambiar a 'bar', 'donut', etc. según lo necesites
      height: 350,
    },
    labels: [],
    legend: {
      position: 'bottom',
    },
    title: {
      text: 'Estadísticas de la Aplicación',
      align: 'center'
    },
    colors: ['#1E88E5', '#66BB6A', '#FFA726', '#FF7043', '#AB47BC'],
  };
  


  selectedSegment = 'user-management';
  usuariosPaginados: any[] = [];
  publicaciones: any[] = [];
  solicitudesAdopcion: any[] = [];
  totalUsuarios: number = 0;
  totalPublicaciones: number = 0;
  totalSolicitudesAprobadas: number = 0;
  totalSolicitudesPendientes: number = 0;
  totalSolicitudesRechazadas: number = 0; // Declara esta nueva propiedad
  searchQuery: string = ''; // Agrega una variable para almacenar la consulta de búsqueda
  usuariosPaginadosOriginal: any[] = []; // Lista completa de usuarios
  totalCentrosAdopcion: number = 0;
  totalMensajes: number = 0;
  totalSolicitudesAdopcion: number = 0;
  centrosAdopcionData: any;
  configCentrosAdopcion: any;
  chartOptionsCentros: Partial<any> | any;
  mensajesData: any[] = [];
  totalUsuariosAdmin: number = 0;
  totalUsuariosUsuario: number = 0;
  totalUsuariosOtros: number = 0;
  loading = false;

  

  


  constructor(
    private fireService: FireserviceService,
    private modalCtrl: ModalController,
    private firestore: AngularFirestore,
    private router: Router,
    private popoverController: PopoverController,
    private alertController: AlertController, // Agregamos AlertController
    private cdr: ChangeDetectorRef,
    private afAuth: AngularFireAuth, // Inyecta AngularFireAuth
    private platform: Platform,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.obtenerDatos(); // Primero obtenemos los datos
    this.obtenerCentrosAdopcion();
    this.configurarGraficoCentrosEspecifico();
    this.obtenerPublicacionesConSolicitudes();
    this.obtenerTotales();
    this.obtenerSolicitudesAdopcion(),
    this.configurarGraficoMensajes();
    this.calcularGraficoEstadoSolicitudes();
    this.actualizarGrafico();
    this.configurarGrafico();
    this.configurarGraficoCentros();
    this.contarTiposDeServicios(); 
    this.obtenerUsuarios();
    this.obtenerTotales().then(() => {
      this.configurarGrafico(); // Configura el gráfico después de obtener los totales
    });
  }

    async obtenerDatos() {
    await Promise.all([
      this.obtenerUsuarios(),
      this.obtenerPublicaciones(),
      this.obtenerCentrosAdopcion(),
      this.obtenerMensajes(),
      this.configurarGraficoMensajes(),
      this.obtenerSolicitudesAdopcion(),
      this.configurarGraficoCentrosEspecifico(),
      this.contarTiposDeServicios(),
      this.calcularGraficoEstadoSolicitudes(),
    ]);
  
    console.log('Usuarios:', this.totalUsuarios);
    console.log('Publicaciones:', this.totalPublicaciones);
    console.log('Centros de Adopción:', this.totalCentrosAdopcion);
    console.log('Mensajes:', this.totalMensajes);
    console.log('Solicitudes de Adopción:', this.totalSolicitudesAdopcion);
  
    // Llama a actualizar el gráfico con los datos cargados
    this.actualizarGrafico();
  }
  

  ionViewDidEnter() {
    this.obtenerPublicacionesConSolicitudes(); // Llama a la función para obtener las publicaciones
    this.obtenerSolicitudesAdopcion(); 
    setTimeout(() => {
      this.cdr.detectChanges(); // Forzar la detección de cambios
    }, 300); // Esperamos 300 ms para mayor seguridad
  }

  async verSolicitud(solicitud: any) {
    const modal = await this.modalCtrl.create({
      component: SolicitudesModalComponent,
      componentProps: {
        solicitud: solicitud  // Pasamos la solicitud completa al modal
      }
    });
    return await modal.present();
  }
  

  actualizarGrafico() {
    this.chartOptions = {
      series: [
        this.totalUsuarios || 0,
        this.totalPublicaciones || 0,
        this.totalCentrosAdopcion || 0,
        this.totalMensajes || 0,
        this.totalSolicitudesAdopcion || 0
      ],
      chart: {
        type: 'pie',
        height: 350
      },
      labels: ['Usuarios', 'Publicaciones', 'Centros', 'Mensajes', 'Solicitudes']
    };
    
  }
  

  async obtenerTotales() {
    try {
      const centrosSnapshot = await this.firestore.collection('centros_adopcion').get().toPromise();
      if (centrosSnapshot) {
        this.totalCentrosAdopcion = centrosSnapshot.size;
      } else {
        console.warn("No se encontraron centros de adopción.");
      }
  
      const mensajesSnapshot = await this.firestore.collection('mensajes').get().toPromise();
      if (mensajesSnapshot) {
        this.totalMensajes = mensajesSnapshot.size;
      } else {
        console.warn("No se encontraron mensajes.");
      }
  
      const publicacionesSnapshot = await this.firestore.collection('publicaciones').get().toPromise();
      if (publicacionesSnapshot) {
        this.totalPublicaciones = publicacionesSnapshot.size;
      } else {
        console.warn("No se encontraron publicaciones.");
      }
  
      const solicitudesSnapshot = await this.firestore.collection('solicitudes_adopcion').get().toPromise();
      if (solicitudesSnapshot) {
        this.totalSolicitudesAdopcion = solicitudesSnapshot.size;
      } else {
        console.warn("No se encontraron solicitudes de adopción.");
      }
  
      const usuariosSnapshot = await this.firestore.collection('users').get().toPromise();
      if (usuariosSnapshot) {
        this.totalUsuarios = usuariosSnapshot.size;
      } else {
        console.warn("No se encontraron usuarios.");
      }
  
      console.log(`Totales: 
        Centros de Adopción: ${this.totalCentrosAdopcion}, 
        Mensajes: ${this.totalMensajes}, 
        Publicaciones: ${this.totalPublicaciones}, 
        Solicitudes de Adopción: ${this.totalSolicitudesAdopcion}, 
        Usuarios: ${this.totalUsuarios}`
      );
    } catch (error) {
      console.error("Error al obtener los totales de las colecciones: ", error);
    }
  }

  contarTiposDeServicios() {
    const servicioContador: { [key: string]: number } = {};
  
    // Recorrer los centros y contar los tipos de servicios
    this.centrosData.forEach(centro => {
      centro.servicios.forEach((servicio: string) => {
        if (servicioContador[servicio]) {
          servicioContador[servicio]++;
        } else {
          servicioContador[servicio] = 1;
        }
      });
    });
  
    // Convertir los datos a un formato para el gráfico
    const nombresServicios = Object.keys(servicioContador);
    const cantidadCentros = Object.values(servicioContador);
  
    console.log('Tipos de servicios:', nombresServicios);
    console.log('Servicios', cantidadCentros);
  
    // Configurar la gráfica de tipos de servicios
    this.chartOptionsServicios = {
      series: [{
        name: 'Cantidad de Centros',
        data: cantidadCentros
      }],
      chart: {
        type: 'bar',
        height: 350
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded'
        }
      },
      dataLabels: {
        enabled: true
      },
      xaxis: {
        categories: nombresServicios
      },
      colors: ['#FF6384', '#36A2EB', '#FFCE56', '#66BB6A', '#FF7043'],
      title: {
        text: 'Servicios',
        align: 'center'
      },
      legend: {
        position: 'bottom'
      }
    };
  }
  
  



  
  configurarGraficoCentrosEspecifico() {
    const nombresCentros = this.centrosData.map((centro: any) => centro.nombre);
    const cantidadServicios = this.centrosData.map((centro: any) => centro.cantidadServicios);
  
    console.log('Nombres de centros:', nombresCentros);
    console.log('Cantidad de servicios disponibles:', cantidadServicios);
  
    this.chartOptionsCentros = {
      series: [{
        name: 'Cantidad de Servicios',
        data: cantidadServicios
      }],
      chart: {
        type: 'bar',
        height: 350
      },
      plotOptions: {
        bar: {
          horizontal: false, // Cambiar a barras verticales
          columnWidth: '55%',
          endingShape: 'rounded'
        }
      },
      dataLabels: {
        enabled: true
      },
      xaxis: {
        categories: nombresCentros
      },
      colors: ['#FF6384', '#36A2EB', '#FFCE56', '#66BB6A', '#FF7043'],
      title: {
        text: 'Centros de Adopción y Cantidad de Servicios',
        align: 'center'
      },
      legend: {
        position: 'bottom'
      }
    };
  }

  // Método para calcular el conteo por tipo de animal
calcularConteoTiposAnimales() {
  const conteo = new Map<string, number>();
  this.publicaciones.forEach(pub => {
    const tipo = pub.mascota.tipo;
    if (conteo.has(tipo)) {
      conteo.set(tipo, conteo.get(tipo)! + 1);
    } else {
      conteo.set(tipo, 1);
    }
  });
  this.conteoTiposAnimales = Array.from(conteo, ([nombre, cantidad]) => ({ nombre, cantidad }));
}



// Método para calcular el conteo por estado de salud
calcularConteoEstadoSalud() {
  const conteo = new Map<string, number>();
  this.publicaciones.forEach(pub => {
    const estadoSalud = pub.mascota.estadoSalud;
    if (conteo.has(estadoSalud)) {
      conteo.set(estadoSalud, conteo.get(estadoSalud)! + 1);
    } else {
      conteo.set(estadoSalud, 1);
    }
  });
  this.conteoEstadoSalud = Array.from(conteo, ([nombre, cantidad]) => ({ nombre, cantidad }));
}

// Similarmente puedes definir los métodos para calcular los demás conteos

  
  
  configurarGraficoCentros() {
    // Extraer los nombres de los centros y la cantidad de mascotas disponibles
    const nombresCentros = this.centrosData.map((centro: any) => centro.nombre);
    const cantidadMascotas = this.centrosData.map((centro: any) => centro.mascotasDisponibles);

    // Configuración del gráfico de centros de adopción
    this.chartOptions = {
      series: [{
        name: 'Mascotas Disponibles',
        data: cantidadMascotas
      }],
      chart: {
        type: 'bar',
        height: 350
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded'
        }
      },
      dataLabels: {
        enabled: true
      },
      xaxis: {
        categories: nombresCentros
      },
      colors: ['#1976D2', '#66BB6A', '#FFA500', '#EF5350', '#FF6384'],
      title: {
        text: 'Centros de Adopción y Mascotas Disponibles',
        align: 'center'
      },
      legend: {
        position: 'bottom'
      }
    };
  }
  
  async obtenerMensajes() {
    return new Promise<void>((resolve) => {
      this.firestore.collection('mensajes').snapshotChanges().subscribe(snapshots => {
        this.mensajesData = snapshots.map((doc) => {
          const mensaje = doc.payload.doc.data() as Mensaje;
  
          // Verificar y asignar valores predeterminados si faltan
          return {
            contenido: mensaje.contenido || 'Mensaje sin título',
            respuestas: mensaje.respuestas || [],
            timestamp: mensaje.timestamp || '',
            usuario: mensaje.usuario || 'Desconocido',
            cantidadRespuestas: mensaje.respuestas ? mensaje.respuestas.length : 0
          };
        });
  
        // Después de obtener los datos, configurar el gráfico
        this.totalMensajes = this.mensajesData.length;
        console.log("Datos de mensajes obtenidos:", this.mensajesData); // Verificar datos obtenidos
        
        // Verificar que los datos se obtuvieron correctamente y luego configurar el gráfico
        this.configurarGraficoMensajes();
  
        resolve();
      });
    });
  }
  
  
  configurarGraficoMensajes() {
    // Verificar los datos antes de mapear
    console.log("Mensajes Data para configurar el gráfico:", this.mensajesData);
  
    // Asegurarse de que todos los mensajes tengan un 'contenido' y 'cantidadRespuestas'
    const nombresMensajes = this.mensajesData.map(mensaje => mensaje.contenido || 'Mensaje sin título');
    const cantidadRespuestas = this.mensajesData.map(mensaje => mensaje.cantidadRespuestas || 0);
  
    // Verificar los datos obtenidos para el gráfico
    console.log("Nombres de mensajes:", nombresMensajes);
    console.log("Cantidad de respuestas:", cantidadRespuestas);
  
    // Configurar opciones para el gráfico
    this.chartOptionsMensajes = {
      series: [
        {
          name: 'Respuestas',
          data: cantidadRespuestas,
        }
      ],
      chart: {
        type: 'bar',
        height: 350
      },
      xaxis: {
        categories: nombresMensajes,
        title: {
          text: 'Conversaciones'
        }
      },
      title: {
        text: 'Conversaciones y Respuestas',
        align: 'center'
      },
      plotOptions: {
        bar: {
          columnWidth: '50%'
        }
      },
      dataLabels: {
        enabled: false
      },
      colors: ['#008FFB'],
      legend: {
        position: 'bottom'
      }
    };
  }
  
  

  async obtenerCentrosAdopcion() {
    return new Promise<void>((resolve) => {
      this.firestore.collection('centros_adopcion').snapshotChanges().subscribe(snapshots => {
        this.totalCentrosAdopcion = snapshots.length;
  
        // Mapeamos los datos obtenidos para tener nombres de centros, cantidad de servicios y los servicios en sí
        this.centrosData = snapshots.map(snap => {
          const data = snap.payload.doc.data() as any;
          console.log('Datos del centro:', data); // Verificar cada centro en la consola
          return {
            nombre: data.nombre || 'Centro Desconocido',
            cantidadServicios: data.servicios?.length || 0, // Contar los servicios disponibles
            servicios: data.servicios || [] // Asegurarse de incluir los servicios
          };
        });
  
        console.log('Datos mapeados de los centros:', this.centrosData);
        this.configurarGraficoCentrosEspecifico();
        this.contarTiposDeServicios();
        resolve();
      });
    });
  }
  

  
  

  configurarGrafico() {
    // Configurar opciones para el gráfico de barras
    this.chartOptions = {
      series: [{
        name: 'Cantidad',
        data: [
          this.totalUsuarios || 0,
          this.totalPublicaciones || 0,
          this.totalCentrosAdopcion || 0,
          this.totalMensajes || 0,
          this.totalSolicitudesAdopcion || 0
        ]
      }],
      chart: {
        type: 'bar', // Cambiar tipo a 'bar' para un gráfico de barras
        height: 350
      },
      plotOptions: {
        bar: {
          horizontal: false, // Barras verticales
          columnWidth: '55%',
          endingShape: 'rounded'
        }
      },
      dataLabels: {
        enabled: true // Mostrar etiquetas en las barras
      },
      xaxis: {
        categories: [
          'Usuarios', 
          'Mascotas', 
          'Hogares de Adopción', 
          'Conversaciones', 
          'Solicitudes de Adopción'
        ] // Etiquetas para el eje X
      },
      colors: ['#1976D2', '#66BB6A', '#FFA500', '#EF5350', '#FF6384'],
      title: {
        text: 'Gráfica de Estadísticas',
        align: 'center'
      },
      legend: {
        position: 'bottom'
      }
    };
  }


  
 
  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  async obtenerUsuarios() {
    return new Promise<void>((resolve) => {
      this.firestore.collection('users').snapshotChanges().subscribe(snapshots => {
        this.usuariosPaginadosOriginal = snapshots.map(snap => {
          const data = snap.payload.doc.data() as any;
          const id = snap.payload.doc.id;
          return {
            uid: data.uid || id, // Asegúrate de obtener el UID correcto
            name: data.name || 'Sin nombre',
            email: data.email || 'Sin email',
            role: data.role || 'user', // Por defecto, asignamos "Usuario"
            createdAt: data.createdAt?.toDate() || 'Fecha desconocida'
          };
        });
  
        // Inicializa usuariosPaginados con todos los usuarios cargados inicialmente
        this.usuariosPaginados = [...this.usuariosPaginadosOriginal];
  
        this.totalUsuarios = this.usuariosPaginados.length;
        console.log('Total de usuariosssssssssss:', this.totalUsuarios); // Verificar si se está actualizando
  
        // Contar usuarios según su rol
        this.totalUsuariosAdmin = this.usuariosPaginadosOriginal.filter(u => u.role === 'admin').length;
        this.totalUsuariosUsuario = this.usuariosPaginadosOriginal.filter(u => u.role === 'user').length;
        this.totalUsuariosOtros = this.usuariosPaginadosOriginal.filter(u => u.role !== 'admin' && u.role !== 'user').length;
  
        // Calcular el gráfico de roles
        this.calcularGraficoUsuariosPorRol();
  
        console.log('Usuariosssssssss Admin:', this.totalUsuariosAdmin);
        console.log('Usuariosssssss Normales:', this.totalUsuariosUsuario);
        console.log('Usuariosssssssss Otros:', this.totalUsuariosOtros); // Verifica que los roles se cuenten correctamente
  
        resolve(); // Asegurar que la promesa se resuelve
      });
    });
  }
  

  // Método para filtrar usuarios por nombre
  filtrarUsuarios() {
    const query = this.searchQuery.trim().toLowerCase();
    if (query === '') {
      // Si no hay texto de búsqueda, muestra todos los usuarios
      this.usuariosPaginados = [...this.usuariosPaginadosOriginal];
    } else {
      // Filtra los usuarios que coincidan con la búsqueda
      this.usuariosPaginados = this.usuariosPaginadosOriginal.filter(usuario =>
        usuario.name.toLowerCase().includes(query)
      );
    }
  }

  // Método para abrir el modal con los datos de la solicitud
async abrirSolicitudModal(solicitud: any) {
  const modal = await this.modalCtrl.create({
    component: SolicitudesModalComponent,
    componentProps: {
      solicitud: solicitud // Pasar los datos de la solicitud al modal
    }
  });

  return await modal.present();
}



  
obtenerPublicaciones() {
  return new Promise<void>((resolve) => {
    this.firestore.collection('publicaciones').snapshotChanges().subscribe(snapshots => {
      console.log('Snapshots de publicaciones:', snapshots); // Verifica si hay resultados
      this.publicaciones = snapshots.map(snap => {
        const data = snap.payload.doc.data() as any;
        console.log('Datos de publicación:', data); // Verifica los datos
        const id = snap.payload.doc.id;
        const imagenURL = data.imagenURL || 'assets/default-avatar.png'; 
        const tipo = data.mascota?.tipo || 'Desconocido';
        const estadoSalud = data.mascota?.estadoSalud || 'No disponible';
        const estado = data.mascota?.estado || 'Desconocido';
        const tipoDonante = data.tipoDonante || 'Desconocido';
        const nombreCentro = data.nombreCentro || 'No disponible';

        return {
          id,
          imagenURL,
          tipo,
          estadoSalud,
          estado,
          tipoDonante,
          nombreCentro,
          mascota: {
            ...data.mascota,
            tipo,
            estadoSalud
          }
        };
      });

      // Procesar las publicaciones para las gráficas
      this.calcularGraficoTiposAnimales();
      this.calcularGraficoEstadoSalud();
      this.calcularGraficoEstadoAdopcion();
      this.calcularGraficoTipoDonante();
      this.calcularGraficoAnimalesPorCentro();

      this.totalPublicaciones = this.publicaciones.length;
      console.log('Total de publicaciones:', this.totalPublicaciones); // Verificar si se está actualizando
      resolve(); // Asegurar que la promesa se resuelve
    });
  });
}

calcularGraficoTiposAnimales() {
  const conteoTipos = this.publicaciones.reduce((acc: any, pub: any) => {
    acc[pub.tipo] = (acc[pub.tipo] || 0) + 1;
    return acc;
  }, {});

  const nombresTipos = Object.keys(conteoTipos);
  const cantidadesTipos = Object.values(conteoTipos).map(Number); // Convertir explícitamente a números

  this.chartOptionsTipoAnimal = {
    series: [{
      name: 'Cantidad',
      data: cantidadesTipos as number[] // Asegurar el tipo de dato
    }],
    chart: {
      type: 'bar',
      height: 350
    },
    xaxis: {
      categories: nombresTipos
    },
    title: {
      text: 'Gráfica Tipos de Mascotas',
      align: 'center'
    }
  };
}

calcularGraficoEstadoSalud() {
  const conteoEstadoSalud = this.publicaciones.reduce((acc: any, pub: any) => {
    const estadoSalud = pub.estadoSalud || 'No disponible'; // Considerar un valor 'No disponible' por defecto si no hay estado de salud definido
    acc[estadoSalud] = (acc[estadoSalud] || 0) + 1;
    return acc;
  }, {});

  const nombresEstadoSalud = Object.keys(conteoEstadoSalud);
  const cantidadesEstadoSalud = Object.values(conteoEstadoSalud).map(Number); // Convertir explícitamente a números

  // Configuración del gráfico de barras para estado de salud
  this.chartOptionsEstadoSalud = {
    series: [{
      name: 'Cantidad',
      data: cantidadesEstadoSalud as number[] // Asegurar que los datos sean números
    }],
    chart: {
      type: 'bar',
      height: 350
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
      }
    },
    dataLabels: {
      enabled: true, // Habilitar etiquetas de datos
      formatter: (val: number) => `${val}`, // Mostrar el valor dentro de las barras
      style: {
        colors: ['#e8f5ff'] // Color del texto dentro de las barras
      }
    },
    xaxis: {
      categories: nombresEstadoSalud
    },
    colors: ['#259ffb'], // Color de las barras
    title: {
      text: 'Gráfica Estado de Salud',
      align: 'center'
    }
  };

  console.log('Datos para gráfico de estado de salud:', conteoEstadoSalud);
}

calcularGraficoEstadoAdopcion() {
  const conteoEstadoAdopcion = this.publicaciones.reduce((acc: any, pub: any) => {
    // Asigna un valor por defecto si el campo "estado" no está presente o está vacío
    const estado = pub.estado || 'No disponible';
    acc[estado] = (acc[estado] || 0) + 1;
    return acc;
  }, {});

  const nombresEstadoAdopcion = Object.keys(conteoEstadoAdopcion);
  const cantidadesEstadoAdopcion = Object.values(conteoEstadoAdopcion).map(Number); // Convertir explícitamente a números

  this.chartOptionsEstadoAdopcion = {
    series: [{
      name: 'Cantidad',
      data: cantidadesEstadoAdopcion as number[] // Asegurar que los datos sean números
    }],
    chart: {
      type: 'bar',
      height: 350
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
      }
    },
    dataLabels: {
      enabled: true, // Habilitar etiquetas de datos
      formatter: (val: number) => `${val}`, // Mostrar el valor dentro de las barras
      style: {
        colors: ['#e8f5ff'] // Color del texto dentro de las barras
      }
    },
    xaxis: {
      categories: nombresEstadoAdopcion
    },
    colors: ['#259ffb'], // Color de las barras
    title: {
      text: 'Grafica Estado de Adopción',
      align: 'center'
    }
  };

  console.log('Datos para gráfico de estado de adopción:', conteoEstadoAdopcion);
}


calcularGraficoTipoDonante() {
  const conteoTipoDonante = this.publicaciones.reduce((acc: any, pub: any) => {
    acc[pub.tipoDonante] = (acc[pub.tipoDonante] || 0) + 1;
    return acc;
  }, {});

  const nombresTipoDonante = Object.keys(conteoTipoDonante);
  const cantidadesTipoDonante = Object.values(conteoTipoDonante).map(Number); // Convertir explícitamente a números

  this.chartOptionsTipoDonante = {
    series: [{
      name: 'Cantidad',
      data: cantidadesTipoDonante as number[] // Asegurar el tipo de dato
    }],
    chart: {
      type: 'bar',
      height: 350
    },
    xaxis: {
      categories: nombresTipoDonante
    },
    title: {
      text: 'Grafica Tipo de Donante',
      align: 'center'
    }
  };
  console.log('Datos para gráfico de tipo de donante:', conteoTipoDonante);
  console.log('Nombres de tipo de donante:', nombresTipoDonante);
}

calcularGraficoAnimalesPorCentro() {
  const conteoPorCentro = this.publicaciones.reduce((acc: any, pub: any) => {
    // Verificar si el nombre del centro no es "Nombre del centro no disponible"
    if (pub.nombreCentro && pub.nombreCentro !== 'Nombre del centro no disponible') {
      acc[pub.nombreCentro] = (acc[pub.nombreCentro] || 0) + 1;
    }
    return acc;
  }, {});

  const nombresCentro = Object.keys(conteoPorCentro);
  const cantidadesCentro = Object.values(conteoPorCentro).map(Number); // Convertir explícitamente a números

  this.chartOptionsAnimalesPorCentro = {
    series: [{
      name: 'Cantidad',
      data: cantidadesCentro as number[] // Asegurar el tipo de dato
    }],
    chart: {
      type: 'bar',
      height: 350
    },
    xaxis: {
      categories: nombresCentro
    },
    title: {
      text: 'Grafica Mascotas por Centro',
      align: 'center'
    }
  };
  console.log('Datos para gráfico de animales por centro:', conteoPorCentro);
  console.log('Nombres de centros:', nombresCentro);
}

calcularGraficoEstadoSolicitudes() {
  // Datos de los estados de las solicitudes
  const estados = ['Aprobadas', 'Pendientes', 'Rechazadas'];
  const cantidades = [
    this.totalSolicitudesAprobadas,
    this.totalSolicitudesPendientes,
    this.totalSolicitudesRechazadas
  ];

  this.chartOptionsEstadoSolicitudes = {
    series: [{
      name: 'Cantidad',
      data: cantidades as number[] // Aseguramos que los datos sean números
    }],
    chart: {
      type: 'bar',
      height: 350
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}`, // Mostrar el valor dentro de las barras
      style: {
        colors: ['#e8f5ff'] // Color del texto dentro de las barras
      }
    },
    xaxis: {
      categories: estados
    },
    colors: ['#259ffb', '#259ffb', '#259ffb'], // Colores para cada estado
    title: {
      text: 'Gráfica de las Solicitudes',
      align: 'center'
    }
  };
}


calcularGraficoUsuariosPorRol() {
  const conteoRoles = this.usuariosPaginadosOriginal.reduce((acc: any, usuario: any) => {
    acc[usuario.role] = (acc[usuario.role] || 0) + 1;
    return acc;
  }, {});
  const nombresRoles = ['Administrador', 'Usuario'];
  //const nombresRoles = Object.keys(conteoRoles);
  const cantidadesRoles = Object.values(conteoRoles).map(Number);

  this.chartOptionsRolesUsuarios = {
    series: [{
      name: 'Cantidad',
      data: cantidadesRoles as number[]
    }],
    chart: {
      type: 'bar',
      height: 350
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}`,
      style: {
        colors: ['#e8f5ff']
      }
    },
    xaxis: {
      categories: nombresRoles
    },
    colors: ['#259ffb'],
    title: {
      text: 'Gráfica de Roles',
      align: 'center'
    }
  };
  console.log('Datos para gráfico de roles de usuarios:', conteoRoles);
}


// Obtener las publicaciones junto con las solicitudes
// Obtener las publicaciones junto con las solicitudes
obtenerPublicacionesConSolicitudes() {
  this.firestore.collection('publicaciones').snapshotChanges().subscribe(snapshots => {
    this.publicaciones = snapshots.map(snap => {
      const data = snap.payload.doc.data() as any;
      const id = snap.payload.doc.id;
      return {
        id,
        imagenURL: data.imagenURL || 'assets/default-avatar.png',
        mascota: {
          ...data.mascota,
          nombre: data.mascota?.nombre || 'Desconocido'
        },
        solicitudes: [],  // Inicialmente vacía
        mostrarSolicitudes: false, // Para controlar la visibilidad de las solicitudes
        solicitudesPendientes: 0 // Nueva propiedad para el conteo de pendientes
      };
    });

    // Por cada publicación, obtener sus solicitudes de adopción
    this.publicaciones.forEach(publicacion => {
      this.firestore.collection('solicitudes_adopcion', ref =>
        ref.where('idMascota', '==', publicacion.id)
      ).snapshotChanges().subscribe(solicitudesSnap => {
        publicacion.solicitudes = solicitudesSnap.map(snap => {
          const solicitudData = snap.payload.doc.data() as any;
          return {
            id: snap.payload.doc.id,
            ...solicitudData,
            documentoURL: solicitudData.documentoURL || null // Asegurarse de que el documentoURL esté presente
          };
        });

        // Contar las solicitudes pendientes para esta publicación
        publicacion.solicitudesPendientes = publicacion.solicitudes.filter((s: any) => s.estado === 'Pendiente').length;
      });
    });
  });
}


  
    // Toggle para mostrar u ocultar las solicitudes
    toggleSolicitudes(publicacion: any) {
      publicacion.mostrarSolicitudes = !publicacion.mostrarSolicitudes;
    }

  
  calcularEstadisticasPublicaciones() {
    const tipos = this.publicaciones.map(p => p.mascota.tipo);
    const tiposUnicos = [...new Set(tipos)];
  
    tiposUnicos.forEach(tipo => {
      const count = tipos.filter(t => t === tipo).length;
      console.log(`Total de ${tipo}: ${count}`);
    });
  }

  obtenerSolicitudesAdopcion() {
    return new Promise<void>((resolve) => {
      this.firestore.collection('solicitudes_adopcion').snapshotChanges().subscribe(snapshots => {
        console.log('Snapshots de solicitudes de adopción:', snapshots); // Verifica si hay resultados
        this.solicitudesAdopcion = snapshots.map(snap => {
          const data = snap.payload.doc.data() as any;
          console.log('Datos de solicitud:', data); // Verifica los datos
          const id = snap.payload.doc.id;
          return {
            id,
            ...data,
            estado: data.estado || 'Pendiente',
            fechaCreacion: data.fechaCreacion?.toDate() || 'Fecha desconocida',
            identificacionURL: data.identificacionURL || null, // Asegúrate de obtener la URL del documento
            tiempoRespuesta: data.fechaRespuesta 
              ? this.calcularTiempoRespuesta(data.fechaCreacion, data.fechaRespuesta) 
              : 'En espera'
          };
        });
  
        // Contar solicitudes según su estado
        this.totalSolicitudesAprobadas = this.solicitudesAdopcion.filter(s => s.estado === 'Aprobada').length;
        this.totalSolicitudesPendientes = this.solicitudesAdopcion.filter(s => s.estado === 'Pendiente').length;
        this.totalSolicitudesRechazadas = this.solicitudesAdopcion.filter(s => s.estado === 'Rechazada').length; // Añadimos rechazadas
  
        console.log('Solicitudes Aprobadasssssss:', this.totalSolicitudesAprobadas);
        console.log('Solicitudes Pendientesssssss:', this.totalSolicitudesPendientes);
        console.log('Solicitudes Rechazadassssssssss:', this.totalSolicitudesRechazadas); // Verifica que las solicitudes rechazadas se cuenten correctamente
  
        // Calcular gráfico de estado de solicitudes
        this.calcularGraficoEstadoSolicitudes();
        
        resolve(); // Asegurar que la promesa se resuelve
      });
    });
  }
  

  // Función para solicitar permisos de almacenamiento
async solicitarPermisoAlmacenamiento() {
  
  if (this.platform.is('android')) { // Verificamos si es un dispositivo Android
    try {
      const permiso = await Filesystem.requestPermissions();
      return permiso.publicStorage === 'granted'; // Verifica si se otorgó acceso al almacenamiento
    } catch (error) {
      console.error('Error al solicitar permiso de almacenamiento:', error);
      return false; // Retorna false si hay un error o el permiso fue denegado
    }
  }
  return true; // Si no es Android, no necesita permiso
}

async presentToast(message: string, duration: number) {
  const toast = await this.toastController.create({
    message: message,
    duration: duration,
    position: 'bottom',
  });
  toast.present();
}

async abrirPDF(filePath: string) {
  try {
    // Leer el archivo PDF desde el sistema de archivos usando la ruta proporcionada
    const result = await Filesystem.readFile({
      path: filePath,
      directory: Directory.Documents,
    });

    // Convertir el resultado Base64 a un Blob
    const base64Data = result.data as string; // Convertir explícitamente a string
    const blob = this.base64ToBlob(base64Data, 'application/pdf'); // Pasar la cadena Base64

    // Crear una URL para el Blob y abrir el archivo en una nueva pestaña
    const objectUrl = URL.createObjectURL(blob);
    window.open(objectUrl, '_blank');
  } catch (error) {
    console.error('Error al abrir el archivo PDF:', error);
    await this.presentToast('No se pudo abrir el archivo PDF.', 3000);
  }
}

// Función auxiliar para convertir Base64 a Blob
base64ToBlob(base64: string, contentType: string): Blob {
  const byteCharacters = atob(base64); // Decodificar Base64
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}




async exportarReportePDF() {
  this.loading = true;
  // Solicitar permisos de almacenamiento para Android
  if (this.platform.is('android')) {
    const permiso = await this.solicitarPermisoAlmacenamiento();
    if (!permiso) {
      console.error('Permiso de almacenamiento denegado');
      return;
    }
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Función para agregar encabezado
  const agregarEncabezado = () => {
    doc.setFontSize(18);
    doc.setTextColor('#1976D2'); // Color azul para el título
    doc.setFont('helvetica', 'bold');
    const text = 'REPORTES GENERALES DE LA APLICACIÓN MÓVIL';
    const textWidth = doc.getTextWidth(text);
    const textX = (pageWidth - textWidth) / 2;
    doc.text(text, textX, 20);
    doc.line(10, 25, 200, 25);
  };

  // Función para agregar pie de página
  const agregarPieDePagina = (paginaActual: number) => {
    const footerText = `Generado automáticamente por la Aplicación Móvil | Página ${paginaActual}`;
    doc.setFontSize(10);
    doc.setTextColor(150);
    const textWidth = doc.getTextWidth(footerText);
    const textX = (pageWidth - textWidth) / 2;
    doc.text(footerText, textX, pageHeight - 10);
  };

  // Agregar encabezado
  agregarEncabezado();

  // Agregar descripción y fecha
  doc.setTextColor(0, 0, 0); // Color negro para el texto principal
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Este reporte proporciona información estadística sobre el uso de la aplicación móvil.', 10, 30);

  // Agregar fecha y hora de impresión
  const fechaHora = new Date().toLocaleString();
  doc.text(`Fecha y hora de impresión: ${fechaHora}`, 10, 40);

  // Función para agregar datos en negrita y colores
  const agregarDato = (texto: string, valor: any, y: number) => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 138, 217); // Azul para el texto principal
    doc.text(`${texto}:`, 10, y);

    doc.setTextColor(255, 0, 0); // Rojo para los valores
    doc.text(`${valor}`, 80, y); // Posicionando los valores a la derecha de los textos
  };

  // Agregar los datos con sus respectivos valores
  let startY = 60;
  agregarDato('Total de Centros de Adopción', this.totalCentrosAdopcion, startY);
  agregarDato('Total de Mensajes', this.totalMensajes, startY + 10);
  agregarDato('Total de Publicaciones', this.totalPublicaciones, startY + 20);
  agregarDato('Total de Solicitudes de Adopción', this.totalSolicitudesAdopcion, startY + 30);
  agregarDato('Total de Usuarios', this.totalUsuarios, startY + 40);

  // Capturar el gráfico como imagen usando html2canvas
  const chartElement = this.chartRef.nativeElement;
  html2canvas(chartElement, { scale: 1.2 }).then((canvas) => { // Reducir la escala para ajustar la imagen
    const imgData = canvas.toDataURL('image/jpeg', 0.8); // Usar JPEG y reducir la calidad

    // Ajustar el tamaño de la imagen para que ocupe solo el 50% del ancho de la página
    const imgWidth = pageWidth * 0.5; // Ocupa el 50% del ancho de la página
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Mantener la proporción de la imagen
    const imgX = (pageWidth - imgWidth) / 2; // Calcular la posición X para centrar la imagen

    if (startY + 60 + imgHeight > pageHeight - 30) {
      doc.addPage();
      agregarEncabezado();
      startY = 20; // Reiniciar la posición en la nueva página
    }

    doc.addImage(imgData, 'JPEG', imgX, startY + 60, imgWidth, imgHeight); // Insertar la imagen

    agregarPieDePagina(1);

    // Generar un nombre de archivo único con marca de tiempo
    const timestamp = new Date().getTime();
    const fileName = `Reporte_general-${timestamp}.pdf`;

    // Guardar el archivo PDF como un blob
    const pdfBlob = doc.output('blob');

    // Convertir el Blob a Base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64data = reader.result as string;

      // Guardar el archivo PDF en el sistema de archivos del dispositivo
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64data.split(',')[1], // Eliminar el prefijo 'data:application/pdf;base64,'
        directory: Directory.Documents,
      });

      console.log('Archivo guardado en:', savedFile.uri);

      // Mostrar el Toast después de guardar el archivo
      await this.presentToast(`El archivo PDF ha sido guardado correctamente en: Documentos`, 3000);
      // Verificar si el archivo realmente existe antes de intentar abrirlo
      try {
        const fileExists = await Filesystem.stat({
          directory: Directory.Documents,
          path: fileName,
        });
        console.log('El archivo existe y su tamaño es:', fileExists.size);
      } catch (error) {
        console.error('Error al verificar el archivo:', error);
      }

      // Abrir el archivo PDF
      //await this.abrirPDF(savedFile.uri);
    };
    this.loading = false;
    reader.readAsDataURL(pdfBlob); // Convierte el Blob a Base64 para guardarlo
  }).catch((error) => {
    console.error('Error al generar la imagen del gráfico:', error);
    this.loading = false;
  });
}



async exportarReporteExcel() {
  this.loading = true;
  const workbook: XLSX.WorkBook = XLSX.utils.book_new();

  // Agregar datos generales
  const dataGeneral = [
    ['APLICACIÓN MÓVIL PARA LA ADOPCIÓN RESPONSABLE'],
    [],
    ['Reporte General del uso de la Aplicación Móvil'],
    [],
    ['Fecha y hora de impresión:', new Date().toLocaleString()],
    [],
    ['Total de Centros de Adopción', this.totalCentrosAdopcion],
    ['Total de Mensajes', this.totalMensajes],
    ['Total de Publicaciones', this.totalPublicaciones],
    ['Total de Solicitudes de Adopción', this.totalSolicitudesAdopcion],
    ['Total de Usuarios', this.totalUsuarios],
  ];

  const worksheetGeneral: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataGeneral);
  XLSX.utils.book_append_sheet(workbook, worksheetGeneral, 'Resumen');

  // Generar el archivo Excel en formato binario (ArrayBuffer)
  const excelBuffer: ArrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  try {
    // Convertir el ArrayBuffer a Base64
    const base64Data = this.arrayBufferToBase64(excelBuffer);
    
    // Guardar el archivo Excel en la carpeta 'Documents' del dispositivo móvil
    const timestamp = new Date().getTime(); // Generar un timestamp único
    const fileName = `Reporte_general-${timestamp}.xlsx`; // Generar un nombre de archivo único
    
    const result = await Filesystem.writeFile({
      path: fileName,                 // Usar el nombre de archivo único
      data: base64Data,               // Los datos en base64
      directory: Directory.Documents, // Guardar en el directorio de documentos
    });
    
    console.log('Archivo guardado en:', result.uri);
    await this.presentToast('El archivo Excel ha sido guardado correctamente en Documentos.', 3000);
    this.loading = false;
  } catch (error) {
    console.error('Error al guardar el archivo Excel:', error);
    await this.presentToast('No se pudo guardar el archivo Excel.', 3000);
    this.loading = false;
  }
}


 

async imprimirReporteCentros() {
  this.loading = true;
  const printContents = document.getElementById('graficoEstadisticas');
  
  if (printContents) {
    html2canvas(printContents, {
      scale: 1.2, // Mantener buena calidad
      useCORS: true
    }).then(async (canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const base64Data = imgData.split(',')[1]; // Obtener solo los datos base64

      // Crear un canvas personalizado con dimensiones de una hoja tamaño carta (8.5 x 11 pulgadas a 96 DPI)
      const cartaWidth = 816; // 8.5 pulgadas * 96 DPI
      const cartaHeight = 1056; // 11 pulgadas * 96 DPI

      const customCanvas = document.createElement('canvas');
      const ctx = customCanvas.getContext('2d');

      // Verificar si ctx no es null
      if (!ctx) {
        console.error('Error al obtener el contexto 2D del canvas.');
        return;
      }

      // Definir las dimensiones del nuevo canvas
      customCanvas.width = cartaWidth;
      customCanvas.height = cartaHeight;

      // Agregar encabezado
      ctx.fillStyle = '#1976D2'; // Color del encabezado
      ctx.font = 'bold 18px Arial';
      ctx.fillText('REPORTES GENERALES DE LA APLICACIÓN MÓVIL', 20, 40); // Agregar título
      ctx.moveTo(10, 50);
      ctx.lineTo(cartaWidth - 10, 50);
      ctx.strokeStyle = '#1976D2';
      ctx.stroke(); // Dibujar línea

      // Agregar descripción y fecha/hora
      const fechaHora = new Date().toLocaleString();
      ctx.font = '12px Arial';
      ctx.fillStyle = '#000'; // Color de texto negro

      // Ajustar texto para que no se salga de la imagen
      const descripcion = 'Este reporte proporciona información detallada sobre el uso de la aplicación móvil.';
      const maxWidth = cartaWidth - 40; // Margen de 20px a los lados
      const lineHeight = 20;

      function wrapText(text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
        const words = text.split(' ');
        let line = '';
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + ' ';
          const metrics = ctx?.measureText(testLine); // Verificar si ctx existe antes de usarlo
          const testWidth = metrics?.width ?? 0;
          if (testWidth > maxWidth && i > 0) {
            ctx?.fillText(line, x, y); // Verificar si ctx existe antes de usarlo
            line = words[i] + ' ';
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx?.fillText(line, x, y); // Verificar si ctx existe antes de usarlo
      }

      // Dividir el texto en varias líneas si es necesario
      wrapText(descripcion, 20, 80, maxWidth, lineHeight);
      ctx.fillText(`Fecha y hora de impresión: ${fechaHora}`, 20, 120);

      // Dibujar la imagen de las estadísticas generada en el nuevo canvas
      const imgWidth = cartaWidth * 0.6; // Ocupa el 60% del ancho de la página
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Mantener la proporción de la imagen
      ctx.drawImage(canvas, (cartaWidth - imgWidth) / 2, 150, imgWidth, imgHeight); // Colocar la imagen centrada y debajo del texto

      // Agregar pie de página
      ctx.font = '10px Arial';
      ctx.fillStyle = '#999'; // Color gris para el pie de página
      ctx.fillText('Generado automáticamente por la Aplicación Móvil', 20, cartaHeight - 30);

      // Convertir el canvas completo a imagen base64
      const finalImageData = customCanvas.toDataURL('image/png');
      const finalBase64Data = finalImageData.split(',')[1]; // Obtener solo los datos base64

      // Solicitar permisos de almacenamiento para Android
      if (this.platform.is('android')) {
        const permiso = await this.solicitarPermisoAlmacenamiento();
        if (!permiso) {
          console.error('Permiso de almacenamiento denegado');
          await this.presentToast('Permiso de almacenamiento denegado.', 3000);
          return;
        }
      }

      try {
        
        const timestamp = new Date().getTime(); // Generar un timestamp único
        const fileName = `Imagen_reporte-${timestamp}.png`; // Generar un nombre de archivo único
        
        // Guardar la imagen con encabezado y pie de página
        const savedFile = await Filesystem.writeFile({
          path: fileName,                // Usar el nombre de archivo único
          data: finalBase64Data,          // Los datos en base64
          directory: Directory.Documents  // Guardar en el directorio de documentos
        });
        

        console.log('Imagen guardada en:', savedFile.uri);
        await this.presentToast('Imagen guardada correctamente en Documentos.', 3000);
        this.loading = false;
      } catch (error) {
        console.error('Error al guardar la imagen:', error);
        await this.presentToast('Error al guardar la imagen.', 3000);
        this.loading = false;
      }
    }).catch((error) => {
      console.error('Error al generar la imagen del gráfico:', error);
      this.presentToast('Error al generar la imagen.', 3000);
      this.loading = false;
    });
  } else {
    console.error('No se encontró el área de impresión.');
    this.presentToast('No se encontró el área de impresión.', 3000);
    this.loading = false;
  }
}

async exportarReporteCentrosPDF() {
  this.loading = true;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10; // Márgenes laterales
  
  // Solicitar permisos de almacenamiento para Android
  if (this.platform.is('android')) {
    const permiso = await this.solicitarPermisoAlmacenamiento();
    if (!permiso) {
      console.error('Permiso de almacenamiento denegado');
      return;
    }
  }

  // Función para agregar encabezado
  const agregarEncabezado = () => {
    doc.setFontSize(18);
    doc.setTextColor('#1976D2'); // Color azul para el título
    doc.setFont('helvetica', 'bold');
    const text = 'Reporte de Servicios de Centros de Adopción';
    const textWidth = doc.getTextWidth(text);
    const textX = (pageWidth - textWidth) / 2;
    doc.text(text, textX, 20);
    doc.line(10, 25, 200, 25);
  };

  // Función para agregar la descripción y la fecha de impresión
  const agregarDescripcion = () => {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Color negro para el texto
    doc.setFont('helvetica', 'normal');
    const descripcion = 'Este reporte proporciona información sobre los servicios ofrecidos por los hogares de adopción registrados.';
    doc.text(descripcion, margin, 35, { maxWidth: pageWidth - 2 * margin });

    // Agregar fecha y hora de impresión
    const fechaHora = new Date().toLocaleString();
    doc.text(`Fecha y hora de impresión: ${fechaHora}`, margin, 45);
  };

  // Función para agregar pie de página
  const agregarPieDePagina = (paginaActual: number) => {
    const footerText = `Reporte generado automáticamente por la Aplicación Móvil | Página ${paginaActual}`;
    doc.setFontSize(10);
    doc.setTextColor(150);
    const textWidth = doc.getTextWidth(footerText);
    const textX = (pageWidth - textWidth) / 2;
    doc.text(footerText, textX, pageHeight - 10);
  };

  // Llamamos a las funciones de encabezado y descripción
  let currentPage = 1;
  agregarEncabezado();
  agregarDescripcion();

  // Seleccionamos las dos secciones específicas para la impresión
  const chartSection = document.querySelector('#accordionCentrosAdopcion ion-card:nth-of-type(1)') as HTMLElement;
  const servicesSection = document.querySelector('#accordionCentrosAdopcion ion-card:nth-of-type(2)') as HTMLElement;

  if (chartSection && servicesSection) {
    // Forzar estilos antes de capturar
    const aplicarEstilos = (element: HTMLElement) => {
      element.style.backgroundColor = '#ffffff'; // Fondo blanco
      element.style.boxShadow = 'none'; // Eliminar sombras
      element.style.border = 'none'; // Eliminar bordes
    };

    aplicarEstilos(chartSection);
    aplicarEstilos(servicesSection);

    setTimeout(() => {
      html2canvas(chartSection, {
        scale: 1,
        useCORS: true,
        backgroundColor: '#ffffff',
      }).then((chartCanvas) => {
        const chartImgData = chartCanvas.toDataURL('image/png');
        const imgWidth = pageWidth - 15 * margin; // Ajustar ancho a 80% del ancho de la página
        const imgHeight = (chartCanvas.height * imgWidth) / chartCanvas.width;
        let currentY = 55;
        const imgX = (pageWidth - imgWidth) / 2; // Centrar la imagen

        // Capturar la sección de lista de servicios
        html2canvas(servicesSection, {
          scale: 1,
          useCORS: true,
          backgroundColor: '#ffffff',
        }).then((servicesCanvas) => {
          const servicesImgData = servicesCanvas.toDataURL('image/png');
          const servicesImgHeight = (servicesCanvas.height * imgWidth) / servicesCanvas.width;
          const imgXServices = (pageWidth - imgWidth) / 2; // Centrar la imagen de la segunda sección

          // Verificar si ambas imágenes caben en la página actual
          if (currentY + imgHeight + servicesImgHeight <= pageHeight - 30) {
            // Si caben ambas imágenes en la misma página
            doc.addImage(chartImgData, 'PNG', imgX, currentY, imgWidth, imgHeight);
            currentY += imgHeight + 20;

            doc.addImage(servicesImgData, 'PNG', imgXServices, currentY, imgWidth, servicesImgHeight);
          } else {
            // Si no caben ambas imágenes en la misma página, crear una nueva página para la segunda imagen
            doc.addImage(chartImgData, 'PNG', imgX, currentY, imgWidth, imgHeight);
            currentY += imgHeight + 20;

            // Crear nueva página y agregar la segunda imagen
            doc.addPage();
            currentPage++;
            agregarEncabezado();
            agregarDescripcion();
            currentY = 20; // Reiniciar la posición Y en la nueva página

            doc.addImage(servicesImgData, 'PNG', imgXServices, currentY, imgWidth, servicesImgHeight);
          }

          // Agregar pie de página
          agregarPieDePagina(currentPage);

          // Generar un nombre de archivo único con marca de tiempo
          const timestamp = new Date().getTime();
          const fileName = `Reporte_servicios_centros_adopcion-${timestamp}.pdf`;

          // Convertir el archivo PDF en un Blob
          const pdfBlob = doc.output('blob');

          // Convertir el Blob a Base64
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64data = reader.result as string;

            // Guardar el archivo PDF en el sistema de archivos del dispositivo
            const savedFile = await Filesystem.writeFile({
              path: fileName,
              data: base64data.split(',')[1], // Eliminar el prefijo 'data:application/pdf;base64,'
              directory: Directory.Documents,
            });

            console.log('Archivo guardado en:', savedFile.uri);
            await this.presentToast(`El archivo PDF ha sido guardado correctamente en Documentos`, 3000);
            this.loading = false;
            // Abrir el archivo PDF
            //await this.abrirPDF(savedFile.uri);
          };

          reader.readAsDataURL(pdfBlob); // Convertir el Blob a Base64
        }).catch((error) => {
          console.error('Error al generar la imagen de la lista de servicios:', error);
          this.loading = false;
        });
      }).catch((error) => {
        console.error('Error al generar la imagen de la sección de gráfico:', error);
        this.loading = false;
      });
    }, 500);
  } else {
    console.error('No se encontraron las secciones para exportar a PDF.');
    this.loading = false;
  }
}

async exportarReporteCentrosExcel() {
  this.loading = true;
  const workbook: XLSX.WorkBook = XLSX.utils.book_new();

  // Crear la primera hoja de Excel para la cantidad de centros que ofrecen cada servicio
  const dataCantidadServicios = [
    ['Reporte de Servicios de Hogares de Adopción'], // Título del reporte
    [`Fecha del reporte: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`],
    ['Descripción: Este reporte proporciona información sobre los servicios ofrecidos por los hogares de adopción registrados.'],
    [],
    ['Cantidad de Hogares que Ofrecen Cada Servicio'], // Encabezado de la sección
    ['Nombre del Servicio', 'Cantidad de Hogares'], // Encabezados de columnas
    ...Object.entries(this.chartOptionsServicios.xaxis.categories).map(([index, nombreServicio], idx) => [
      nombreServicio,
      this.chartOptionsServicios.series[0].data[idx]
    ])
  ];

  const worksheetCantidadServicios: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataCantidadServicios);
  XLSX.utils.book_append_sheet(workbook, worksheetCantidadServicios, 'Cantidad Servicios');

  // Crear la segunda hoja de Excel para los servicios ofrecidos por cada centro
  const dataServiciosOfrecidos = [
    ['Servicios Ofrecidos por Cada Hogar'], // Encabezado de la sección
    ['Nombre del Hogar', 'Servicios Ofrecidos'], // Encabezados de columnas
    ...this.centrosData.map(centro => [
      centro.nombre,
      centro.servicios.join(', ')
    ])
  ];

  const worksheetServiciosOfrecidos: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataServiciosOfrecidos);
  XLSX.utils.book_append_sheet(workbook, worksheetServiciosOfrecidos, 'Servicios por Hogar');

  // Generar el archivo Excel en formato binario (ArrayBuffer)
  const excelBuffer: ArrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  try {
    // Convertir el ArrayBuffer a Base64
    const base64Data = this.arrayBufferToBase64(excelBuffer);

    // Generar un nombre de archivo único
    const timestamp = new Date().getTime();
    const fileName = `Reporte_servicios_centros_adopcion-${timestamp}.xlsx`;

    // Guardar el archivo Excel en la carpeta 'Documents' del dispositivo móvil
    const result = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Documents,
    });

    console.log('Archivo guardado en:', result.uri);
    await this.presentToast('El archivo Excel ha sido guardado correctamente en Documentos.', 3000);

  } catch (error) {
    console.error('Error al guardar el archivo Excel:', error);
    await this.presentToast('No se pudo guardar el archivo Excel.', 3000);
  }
}

// Función auxiliar para convertir ArrayBuffer a Base64
arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary); // Retorna el contenido en Base64
}


async imprimirReporte() {
  this.loading = true;
  const printContents = document.getElementById('graficoEstadisticas');
  
  if (printContents) {
    html2canvas(printContents, {
      scale: 1.0, // Mantener buena calidad sin exagerar el tamaño
      useCORS: true
    }).then(async (canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const base64Data = imgData.split(',')[1]; // Obtener solo los datos base64

      // Crear un canvas personalizado con dimensiones de una hoja tamaño carta (8.5 x 11 pulgadas a 96 DPI)
      const cartaWidth = 816; // 8.5 pulgadas * 96 DPI
      const cartaHeight = 1056; // 11 pulgadas * 96 DPI

      const customCanvas = document.createElement('canvas');
      const ctx = customCanvas.getContext('2d');

      // Verificar si ctx no es null
      if (!ctx) {
        console.error('Error al obtener el contexto 2D del canvas.');
        return;
      }

      // Definir las dimensiones del nuevo canvas
      customCanvas.width = cartaWidth;
      customCanvas.height = cartaHeight;

      // Agregar encabezado
      ctx.fillStyle = '#1976D2'; // Color del encabezado
      ctx.font = 'bold 18px Arial';
      ctx.fillText('REPORTES GENERALES DE LA APLICACIÓN MÓVIL', 20, 40); // Agregar título
      ctx.moveTo(10, 50);
      ctx.lineTo(cartaWidth - 10, 50);
      ctx.strokeStyle = '#1976D2';
      ctx.stroke(); // Dibujar línea

      // Agregar descripción y fecha/hora
      const fechaHora = new Date().toLocaleString();
      ctx.font = '12px Arial';
      ctx.fillStyle = '#000'; // Color de texto negro

      // Ajustar texto para que no se salga de la imagen
      const descripcion = 'Este reporte proporciona información detallada sobre el uso de la aplicación móvil.';
      const maxWidth = cartaWidth - 40; // Margen de 20px a los lados
      const lineHeight = 20;

      function wrapText(text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
        const words = text.split(' ');
        let line = '';
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + ' ';
          const metrics = ctx?.measureText(testLine); // Verificar si ctx existe antes de usarlo
          const testWidth = metrics?.width ?? 0;
          if (testWidth > maxWidth && i > 0) {
            ctx?.fillText(line, x, y); // Verificar si ctx existe antes de usarlo
            line = words[i] + ' ';
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx?.fillText(line, x, y); // Verificar si ctx existe antes de usarlo
      }

      // Dividir el texto en varias líneas si es necesario
      wrapText(descripcion, 20, 80, maxWidth, lineHeight);
      ctx.fillText(`Fecha y hora de impresión: ${fechaHora}`, 20, 120);

      // Redimensionar la imagen para que sea más pequeña y quepa en la hoja
      const imgWidth = cartaWidth * 0.5; // Reducir al 50% del ancho de la página
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Mantener la proporción de la imagen
      ctx.drawImage(canvas, (cartaWidth - imgWidth) / 2, 150, imgWidth, imgHeight); // Colocar la imagen centrada y debajo del texto

      // Agregar pie de página
      ctx.font = '10px Arial';
      ctx.fillStyle = '#999'; // Color gris para el pie de página
      ctx.fillText('Generado automáticamente por la Aplicación Móvil', 20, cartaHeight - 30);

      // Convertir el canvas completo a imagen base64
      const finalImageData = customCanvas.toDataURL('image/png');
      const finalBase64Data = finalImageData.split(',')[1]; // Obtener solo los datos base64

      // Solicitar permisos de almacenamiento para Android
      if (this.platform.is('android')) {
        const permiso = await this.solicitarPermisoAlmacenamiento();
        if (!permiso) {
          console.error('Permiso de almacenamiento denegado');
          await this.presentToast('Permiso de almacenamiento denegado.', 3000);
          return;
        }
      }

      try {
        const timestamp = new Date().getTime(); // Generar un timestamp único
        const fileName = `Imagen_reporte-${timestamp}.png`; // Generar un nombre de archivo único
        
        // Guardar la imagen con encabezado y pie de página
        const savedFile = await Filesystem.writeFile({
          path: fileName,                // Usar el nombre de archivo único
          data: finalBase64Data,          // Los datos en base64
          directory: Directory.Documents  // Guardar en el directorio de documentos
        });

        console.log('Imagen guardada en:', savedFile.uri);
        await this.presentToast('Imagen guardada correctamente en Documentos.', 3000);
        this.loading = false;

      } catch (error) {
        console.error('Error al guardar la imagen:', error);
        await this.presentToast('Error al guardar la imagen.', 3000);
        this.loading = false;
      }
    }).catch((error) => {
      console.error('Error al generar la imagen del gráfico:', error);
      this.presentToast('Error al generar la imagen.', 3000);
      this.loading = false;
    });
  } else {
    console.error('No se encontró el área de impresión.');
    this.presentToast('No se encontró el área de impresión.', 3000);
    this.loading = false;
  }
}


async exportarReporteMensajesPDF() {
  this.loading = true;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10; // Márgenes laterales

  // Solicitar permisos de almacenamiento para Android
  if (this.platform.is('android')) {
    const permiso = await this.solicitarPermisoAlmacenamiento();
    if (!permiso) {
      console.error('Permiso de almacenamiento denegado');
      return;
    }
  }

  // Función para agregar encabezado
  const agregarEncabezado = () => {
    doc.setFontSize(18);
    doc.setTextColor('#1976D2'); // Color azul para el título
    doc.setFont('helvetica', 'bold');
    const text = 'Gráfica de Mensajes y Respuestas';
    const textWidth = doc.getTextWidth(text);
    const textX = (pageWidth - textWidth) / 2;
    doc.text(text, textX, 20);
    doc.line(10, 25, 200, 25);
  };

  // Función para agregar descripción y fecha de impresión
  const agregarDescripcionYFecha = () => {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Color negro para el texto principal
    doc.setFont('helvetica', 'normal');
    const descripcion = 'Este gráfico muestra la cantidad de respuestas por cada conversación registrada en la aplicación móvil.';
    const fechaHora = new Date().toLocaleString();
    
    // Añadir descripción
    doc.text(descripcion, margin, 35, { maxWidth: pageWidth - 2 * margin });

    // Añadir fecha y hora de la descarga
    doc.text(`Fecha y hora de descarga: ${fechaHora}`, margin, 45);
  };

  // Función para agregar pie de página
  const agregarPieDePagina = (paginaActual: number) => {
    const footerText = `Reporte generado automáticamente por la Aplicación Móvil | Página ${paginaActual}`;
    doc.setFontSize(10);
    doc.setTextColor(150);
    const textWidth = doc.getTextWidth(footerText);
    const textX = (pageWidth - textWidth) / 2;
    doc.text(footerText, textX, doc.internal.pageSize.getHeight() - 10);
  };

  // Llamamos a las funciones de encabezado y descripción
  const currentPage = 1;
  agregarEncabezado();
  agregarDescripcionYFecha();

  // Seleccionar el contenedor de la gráfica de mensajes para capturar
  const chartElement = this.chartRefMensajes.nativeElement;

  if (chartElement) {
    // Capturar el gráfico de mensajes como imagen usando html2canvas
    html2canvas(chartElement, {
      scale: 1.5, // Aumenta la calidad de la imagen en el PDF
      useCORS: true,
      backgroundColor: '#ffffff'
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 15 * margin; // Reducir el ancho para ocupar un 80% del ancho de la hoja
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Mantener la proporción de la imagen
      const imgX = (pageWidth - imgWidth) / 2; // Calcular la posición X para centrar la imagen
      const imgY = 55; // Posicionar la imagen un poco más abajo de la descripción

      // Insertar la imagen en el PDF
      doc.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight);

      // Agregar pie de página
      agregarPieDePagina(currentPage);

      // Convertir el archivo PDF en un Blob
      const pdfBlob = doc.output('blob');

      // Convertir el Blob a Base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;

        // Generar un nombre de archivo único con marca de tiempo
        const timestamp = new Date().getTime();
        const fileName = `Reporte_grafica_mensajes-${timestamp}.pdf`;

        // Guardar el archivo PDF en el sistema de archivos del dispositivo
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64data.split(',')[1], // Eliminar el prefijo 'data:application/pdf;base64,'
          directory: Directory.Documents,
        });

        console.log('Archivo guardado en:', savedFile.uri);
        await this.presentToast(`El archivo PDF ha sido guardado correctamente en Documentos`, 3000);
        this.loading = false;
        // Abrir el archivo PDF
        //await this.abrirPDF(savedFile.uri);
      };

      reader.readAsDataURL(pdfBlob); // Convertir el Blob a Base64
    }).catch((error) => {
      console.error('Error al generar la imagen del gráfico de mensajes:', error);
      this.loading = false;
    });
  } else {
    console.error('No se encontró el gráfico de mensajes para exportar a PDF.');
    this.loading = false;
  }
}

async exportarReporteMensajesExcel() {
  this.loading = true;
  const workbook: XLSX.WorkBook = XLSX.utils.book_new();

  const dataMensajes = [
    ['Reporte de Conversaciones de la Aplicación'], // Título del reporte
    [`Fecha del reporte: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`],
    ['Descripción: Este reporte proporciona información detallada de las conversaciones registradas en la aplicación móvil.'],
    [],
    ['Número de Conversación', 'Contenido', 'Usuario', 'Fecha', 'Cantidad de Respuestas'], // Encabezados de columnas
    ...this.mensajesData.map((mensaje, index) => [
      index + 1,
      mensaje.contenido,
      mensaje.usuario,
      mensaje.timestamp,
      mensaje.cantidadRespuestas
    ])
  ];

  const worksheetMensajes: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataMensajes);
  XLSX.utils.book_append_sheet(workbook, worksheetMensajes, 'Conversaciones');

  // Generar el archivo Excel en formato binario (ArrayBuffer)
  const excelBuffer: ArrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  try {
    // Convertir el ArrayBuffer a Base64
    const base64Data = this.arrayBufferToBase64(excelBuffer);

    // Generar un nombre de archivo único
    const timestamp = new Date().getTime();
    const fileName = `Reporte_mensajes-${timestamp}.xlsx`;

    // Guardar el archivo Excel en la carpeta 'Documents' del dispositivo móvil
    const result = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Documents,
    });

    console.log('Archivo guardado en:', result.uri);
    await this.presentToast('El archivo Excel ha sido guardado correctamente en Documentos.', 3000);
    this.loading = false;

  } catch (error) {
    console.error('Error al guardar el archivo Excel:', error);
    await this.presentToast('No se pudo guardar el archivo Excel.', 3000);
    this.loading = false;
  }
}

async imprimirReporteMensajes() {
  this.loading = true;
  // Seleccionar el contenedor de la gráfica de mensajes para capturar
  const chartElement = this.chartRefMensajes.nativeElement;

  if (chartElement) {
    // Generar la imagen de la gráfica con html2canvas
    html2canvas(chartElement, {
      scale: 1.5, // Aumenta la calidad de la imagen
      useCORS: true,
      backgroundColor: '#ffffff'
    }).then(async (canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const base64Data = imgData.split(',')[1]; // Obtener solo los datos base64

      // Crear un canvas personalizado con dimensiones de una hoja tamaño carta (8.5 x 11 pulgadas a 96 DPI)
      const cartaWidth = 816; // 8.5 pulgadas * 96 DPI
      const cartaHeight = 1056; // 11 pulgadas * 96 DPI

      const customCanvas = document.createElement('canvas');
      const ctx = customCanvas.getContext('2d');

      // Verificar si ctx no es null
      if (!ctx) {
        console.error('Error al obtener el contexto 2D del canvas.');
        return;
      }

      // Definir las dimensiones del nuevo canvas
      customCanvas.width = cartaWidth;
      customCanvas.height = cartaHeight;

      // Agregar encabezado
      ctx.fillStyle = '#1976D2'; // Color del encabezado
      ctx.font = 'bold 18px Arial';
      ctx.fillText('Gráfica de Conversaciones y Respuestas', 20, 40); // Agregar título
      ctx.moveTo(10, 50);
      ctx.lineTo(cartaWidth - 10, 50);
      ctx.strokeStyle = '#1976D2';
      ctx.stroke(); // Dibujar línea

      // Agregar descripción y fecha/hora
      const fechaHora = new Date().toLocaleString();
      ctx.font = '12px Arial';
      ctx.fillStyle = '#000'; // Color de texto negro

      // Ajustar texto para que no se salga de la imagen
      const descripcion = 'Este gráfico muestra la cantidad de respuestas por cada conversación registrada en la aplicación móvil.';
      const maxWidth = cartaWidth - 40; // Margen de 20px a los lados
      const lineHeight = 20;

      function wrapText(text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
        const words = text.split(' ');
        let line = '';
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + ' ';
          const metrics = ctx?.measureText(testLine); // Verificar si ctx existe antes de usarlo
          const testWidth = metrics?.width ?? 0;
          if (testWidth > maxWidth && i > 0) {
            ctx?.fillText(line, x, y); // Verificar si ctx existe antes de usarlo
            line = words[i] + ' ';
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx?.fillText(line, x, y); // Verificar si ctx existe antes de usarlo
      }

      // Dividir el texto en varias líneas si es necesario
      wrapText(descripcion, 20, 80, maxWidth, lineHeight);
      ctx.fillText(`Fecha y hora de impresión: ${fechaHora}`, 20, 120);

      // Redimensionar la imagen para que sea más pequeña y quepa en la hoja
      const imgWidth = cartaWidth * 0.6; // Reducir al 60% del ancho de la página
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Mantener la proporción de la imagen
      ctx.drawImage(canvas, (cartaWidth - imgWidth) / 2, 150, imgWidth, imgHeight); // Colocar la imagen centrada y debajo del texto

      // Agregar pie de página
      ctx.font = '10px Arial';
      ctx.fillStyle = '#999'; // Color gris para el pie de página
      ctx.fillText('Reporte generado automáticamente por la Aplicación Móvil', 20, cartaHeight - 30);

      // Convertir el canvas completo a imagen base64
      const finalImageData = customCanvas.toDataURL('image/png');
      const finalBase64Data = finalImageData.split(',')[1]; // Obtener solo los datos base64

      // Solicitar permisos de almacenamiento para Android
      if (this.platform.is('android')) {
        const permiso = await this.solicitarPermisoAlmacenamiento();
        if (!permiso) {
          console.error('Permiso de almacenamiento denegado');
          await this.presentToast('Permiso de almacenamiento denegado.', 3000);
          return;
        }
      }

      try {
        const timestamp = new Date().getTime(); // Generar un timestamp único
        const fileName = `Imagen_reporte_mensajes-${timestamp}.png`; // Generar un nombre de archivo único
        
        // Guardar la imagen con encabezado y pie de página
        const savedFile = await Filesystem.writeFile({
          path: fileName,                // Usar el nombre de archivo único
          data: finalBase64Data,          // Los datos en base64
          directory: Directory.Documents  // Guardar en el directorio de documentos
        });

        console.log('Imagen guardada en:', savedFile.uri);
        await this.presentToast('Imagen guardada correctamente en Documentos.', 3000);
        this.loading = false;

      } catch (error) {
        console.error('Error al guardar la imagen:', error);
        await this.presentToast('Error al guardar la imagen.', 3000);
        this.loading = false;
      }
    }).catch((error) => {
      console.error('Error al generar la imagen del gráfico de mensajes para impresión:', error);
      this.presentToast('Error al generar la imagen.', 3000);
      this.loading = false;
    });
  } else {
    console.error('No se encontró el gráfico de mensajes para imprimir.');
    this.presentToast('No se encontró el gráfico de mensajes para imprimir.', 3000);
    this.loading = false;
  }
}

async exportarReportePublicacionesPDF() {
  this.loading = true;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10; // Márgenes laterales

  // Solicitar permisos de almacenamiento para Android
  if (this.platform.is('android')) {
    const permiso = await this.solicitarPermisoAlmacenamiento();
    if (!permiso) {
      console.error('Permiso de almacenamiento denegado');
      return;
    }
  }

  // Función para agregar encabezado
  const agregarEncabezado = () => {
    doc.setFontSize(18);
    doc.setTextColor('#1976D2');
    doc.setFont('helvetica', 'bold');
    const text = 'Reporte de Mascotas con Gráficas';
    const textWidth = doc.getTextWidth(text);
    const textX = (pageWidth - textWidth) / 2;
    doc.text(text, textX, 20);
    doc.line(10, 25, 200, 25);
  };

  // Función para agregar descripción
  const agregarDescripcion = () => {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    const descripcion = 'Este reporte proporciona información y gráficas sobre las mascotas.';
    doc.text(descripcion, margin, 35, { maxWidth: pageWidth - 2 * margin });

    // Agregar fecha y hora de impresión
    const fechaHora = new Date().toLocaleString();
    doc.text(`Fecha y hora de impresión: ${fechaHora}`, margin, 45);
  };

  // Función para agregar pie de página
  const agregarPieDePagina = (paginaActual: number) => {
    const footerText = `Generado automáticamente por la Aplicación Móvil | Página ${paginaActual}`;
    doc.setFontSize(10);
    doc.setTextColor(150);
    const textWidth = doc.getTextWidth(footerText);
    const textX = (pageWidth - textWidth) / 2;
    doc.text(footerText, textX, doc.internal.pageSize.getHeight() - 10);
  };

  let currentPage = 1;
  agregarEncabezado();
  agregarDescripcion();

  const sections = [
    '#graficoTiposAnimales',
    '#graficoEstadoSalud',
    '#graficoEstadoAdopcion',
    '#graficoTipoDonante',
    '#graficoAnimalesPorCentro'
  ];

  let currentY = 55; // Posición inicial Y para las imágenes

  // Capturar todas las secciones en paralelo
  const promises = sections.map((selector) => {
    const section = document.querySelector(selector) as HTMLElement;
    if (section) {
      return html2canvas(section, { scale: 0.75, useCORS: true, backgroundColor: '#ffffff' })
        .then((canvas) => canvas.toDataURL('image/png'))
        .catch((error) => {
          console.error('Error al capturar la sección:', selector, error);
          return null;
        });
    } else {
      console.error('Sección no encontrada:', selector);
      return null;
    }
  });

  const capturedImages = await Promise.all(promises);

  // Agregar las imágenes capturadas al PDF
  for (const imgData of capturedImages) {
    if (imgData) {
      const imgWidth = pageWidth - 17 * margin;
      const imgHeight = (pageWidth * imgWidth) / pageWidth;
      const imgX = (pageWidth - imgWidth) / 2;

      if (currentY + imgHeight > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage();
        currentPage++;
        agregarEncabezado();
        currentY = 30;
      }

      doc.addImage(imgData, 'PNG', imgX, currentY, imgWidth, imgHeight);
      agregarPieDePagina(currentPage);
      currentY += imgHeight + 10;
    }
  }

  // Guardar el archivo PDF directamente como Blob
  const pdfBlob = doc.output('blob');
  const timestamp = new Date().getTime();
  const fileName = `Reporte_publicaciones-${timestamp}.pdf`;

  try {
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: pdfBlob, // Guardar directamente el blob sin convertir a Base64
      directory: Directory.Documents,
    });
    console.log('Archivo guardado en:', savedFile.uri);
    await this.presentToast('El archivo PDF ha sido guardado correctamente en Documentos', 3000);
    this.loading = false;
  } catch (error) {
    console.error('Error al guardar el archivo PDF:', error);
    await this.presentToast('Error al guardar el archivo PDF.', 3000);
    this.loading = false;
  }
}


async exportarReportePublicacionesExcel() {
  this.loading = true;
  const workbook: XLSX.WorkBook = XLSX.utils.book_new();
  const fechaHora = new Date().toLocaleString();

  // Agregar hoja de descripción general
  const dataDescripcion = [
    ['Reporte de Mascotas con Gráficas'],
    [`Fecha del reporte: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`],
    ['Descripción: Este reporte proporciona información y gráficas sobre las mascotas.']
  ];
  const hojaDescripcion: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataDescripcion);
  XLSX.utils.book_append_sheet(workbook, hojaDescripcion, 'Descripción');

  // Función auxiliar para obtener datos de las gráficas
  const obtenerDatosGrafica = (chartOptions: any, nombreHoja: string, headers: string[]) => {
    if (!chartOptions || !chartOptions.xaxis || !chartOptions.series) {
      console.warn(`Gráfico ${nombreHoja} no disponible o incompleto.`);
      return [];
    }

    const categorias = chartOptions.xaxis.categories || [];
    const datos = chartOptions.series[0].data || [];

    return [
      [nombreHoja],
      headers,
      ...categorias.map((categoria: string, index: number) => [
        categoria,
        typeof datos[index] === 'number' ? datos[index] : 0
      ])
    ];
  };

  // Crear hoja de Tipos de Animales
  const dataTiposAnimales = obtenerDatosGrafica(
    this.chartOptionsTipoAnimal,
    'Tipos de Animales',
    ['Tipo de Animal', 'Cantidad']
  );
  const hojaTiposAnimales: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataTiposAnimales);
  XLSX.utils.book_append_sheet(workbook, hojaTiposAnimales, 'Tipos de Animales');

  // Crear hoja de Estado de Salud de Animales
  const dataEstadoSalud = obtenerDatosGrafica(
    this.chartOptionsEstadoSalud,
    'Estado de Salud de Animales',
    ['Estado de Salud', 'Cantidad']
  );
  const hojaEstadoSalud: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataEstadoSalud);
  XLSX.utils.book_append_sheet(workbook, hojaEstadoSalud, 'Estado de Salud');

  // Crear hoja de Estado de Adopción de Animales
  const dataEstadoAdopcion = obtenerDatosGrafica(
    this.chartOptionsEstadoAdopcion,
    'Estado de Adopción de Animales',
    ['Estado de Adopción', 'Cantidad']
  );
  const hojaEstadoAdopcion: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataEstadoAdopcion);
  XLSX.utils.book_append_sheet(workbook, hojaEstadoAdopcion, 'Estado de Adopción');

  // Crear hoja de Tipo de Donante
  const dataTipoDonante = obtenerDatosGrafica(
    this.chartOptionsTipoDonante,
    'Tipo de Donante',
    ['Tipo de Donante', 'Cantidad']
  );
  const hojaTipoDonante: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataTipoDonante);
  XLSX.utils.book_append_sheet(workbook, hojaTipoDonante, 'Tipo de Donante');

  // Crear hoja de Animales por Centro
  const dataAnimalesPorCentro = obtenerDatosGrafica(
    this.chartOptionsAnimalesPorCentro,
    'Cantidad de Animales por Centro',
    ['Centro de Adopción', 'Cantidad']
  );
  const hojaAnimalesPorCentro: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataAnimalesPorCentro);
  XLSX.utils.book_append_sheet(workbook, hojaAnimalesPorCentro, 'Animales por Centro');

  // Generar el archivo Excel en formato binario (ArrayBuffer)
  const excelBuffer: ArrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  try {
    // Convertir el ArrayBuffer a Base64
    const base64Data = this.arrayBufferToBase64(excelBuffer);

    // Generar un nombre de archivo único
    const timestamp = new Date().getTime();
    const fileName = `Reporte_publicaciones-${timestamp}.xlsx`;

    // Guardar el archivo Excel en la carpeta 'Documents' del dispositivo móvil
    const result = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Documents,
    });

    console.log('Archivo guardado en:', result.uri);
    await this.presentToast('El archivo Excel ha sido guardado correctamente en Documentos.', 3000);
    this.loading = false;

  } catch (error) {
    console.error('Error al guardar el archivo Excel:', error);
    await this.presentToast('No se pudo guardar el archivo Excel.', 3000);
    this.loading = false;
  }
}

async imprimirReportePublicaciones() {
  this.loading = true;
  const sections = [
    { id: '#graficoTiposAnimales', title: 'Tipos de Animales' },
    { id: '#graficoEstadoSalud', title: 'Estado de Salud de Animales' },
    { id: '#graficoEstadoAdopcion', title: 'Estado de Adopción' },
    { id: '#graficoTipoDonante', title: 'Tipo de Donante' },
    { id: '#graficoAnimalesPorCentro', title: 'Cantidad de Animales por Centro' }
  ];

  // Crear un canvas con tamaño carta (8.5 x 11 pulgadas a 96 DPI)
  const cartaWidth = 816; // 8.5 pulgadas * 96 DPI
  const cartaHeight = 1056; // 11 pulgadas * 96 DPI
  const customCanvas = document.createElement('canvas');
  const ctx = customCanvas.getContext('2d');

  if (!ctx) {
    console.error('Error al obtener el contexto 2D del canvas.');
    return;
  }

  customCanvas.width = cartaWidth;
  customCanvas.height = cartaHeight;

  // Encabezado
  ctx.fillStyle = '#1976D2'; // Color del encabezado
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Reporte de Mascotas con Gráficas', 20, 40); // Agregar título
  ctx.moveTo(10, 50);
  ctx.lineTo(cartaWidth - 10, 50);
  ctx.strokeStyle = '#1976D2';
  ctx.stroke(); // Dibujar línea

  // Descripción y fecha/hora
  const fechaHora = new Date().toLocaleString();
  ctx.font = '12px Arial';
  ctx.fillStyle = '#000'; // Color de texto negro
  const descripcion = 'Este reporte proporciona información y gráficas sobre las mascotas.';
  const maxWidth = cartaWidth - 40; // Margen de 20px a los lados
  const lineHeight = 20;

  function wrapText(text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx?.measureText(testLine); 
      const testWidth = metrics?.width ?? 0;
      if (testWidth > maxWidth && i > 0) {
        ctx?.fillText(line, x, y);
        line = words[i] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx?.fillText(line, x, y); 
  }

  wrapText(descripcion, 20, 80, maxWidth, lineHeight);
  ctx.fillText(`Fecha y hora de impresión: ${fechaHora}`, 20, 120);

  const currentY = 150;
  const columnGap = 20; 
  const rowGap = 40; 
  const imgWidth = cartaWidth * 0.4; 
  let col = 0; 
  let row = 0;

  // Captura de todas las secciones en paralelo
  const capturePromises = sections.map(section => {
    const chartElement = document.querySelector(section.id) as HTMLElement;
    if (chartElement) {
      return html2canvas(chartElement, { scale: 0.75, useCORS: true, backgroundColor: '#ffffff' })
        .then(canvas => ({ section, canvas }))
        .catch(error => {
          console.error('Error al capturar la sección:', section.id, error);
          return null;
        });
    } else {
      console.error('Sección no encontrada:', section.id);
      return null;
    }
  });

  // Esperar a que todas las capturas estén listas
  const capturedImages = await Promise.all(capturePromises);

  // Dibujar las imágenes capturadas en el canvas
  capturedImages.forEach((imageData) => {
    if (imageData) {
      const { section, canvas } = imageData;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const posX = col === 0 ? 20 : cartaWidth / 2 + columnGap; 
      const posY = currentY + row * (imgHeight + rowGap);

      ctx.font = 'bold 14px Arial';
      ctx.fillText(section.title, posX, posY);
      ctx.drawImage(canvas, posX, posY + 20, imgWidth, imgHeight); 

      if (col === 1) {
        row++; 
      }
      col = (col + 1) % 2; 
    }
  });

  // Guardar la imagen final cuando todas las secciones hayan sido capturadas
  const finalImageData = customCanvas.toDataURL('image/png');
  const finalBase64Data = finalImageData.split(',')[1]; 

  if (this.platform.is('android')) {
    const permiso = await this.solicitarPermisoAlmacenamiento();
    if (!permiso) {
      console.error('Permiso de almacenamiento denegado');
      this.presentToast('Permiso de almacenamiento denegado.', 3000);
      return;
    }

    const timestamp = new Date().getTime();
    const fileName = `Imagen_reporte_publicaciones-${timestamp}.png`;

    try {
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: finalBase64Data,
        directory: Directory.Documents
      });
      console.log('Imagen guardada en:', savedFile.uri);
      await this.presentToast('Imagen guardada correctamente en Documentos.', 3000);
      this.loading = false;
    } catch (error) {
      console.error('Error al guardar la imagen:', error);
      await this.presentToast('Error al guardar la imagen.', 3000);
      this.loading = false;
    }
  } else {
    console.error('Plataforma no compatible para permisos de almacenamiento.');
  }
}


async exportarReporteSolicitudesPDF() {
  this.loading = true;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;

  // Solicitar permisos de almacenamiento para Android si es necesario (optimización en móviles)
  if (this.platform.is('android')) {
    const permiso = await this.solicitarPermisoAlmacenamiento();
    if (!permiso) {
      console.error('Permiso de almacenamiento denegado');
      return;
    }
  }

  // Función para agregar encabezado
  const agregarEncabezado = () => {
    doc.setFontSize(18);
    doc.setTextColor('#1976D2');
    doc.setFont('helvetica', 'bold');
    const text = 'Reporte de Solicitudes de Adopción';
    const textWidth = doc.getTextWidth(text);
    const textX = (pageWidth - textWidth) / 2;
    doc.text(text, textX, 20);
    doc.line(10, 25, 200, 25);
  };

  // Función para agregar descripción
  const agregarDescripcion = () => {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    const descripcion = 'Este reporte proporciona información y gráficas sobre las solicitudes de adopción de mascotas.';
    doc.text(descripcion, margin, 35, { maxWidth: pageWidth - 2 * margin });

    // Agregar fecha y hora de impresión
    const fechaHora = new Date().toLocaleString();
    doc.text(`Fecha y hora de impresión: ${fechaHora}`, margin, 45);
  };

  // Función para agregar pie de página
  const agregarPieDePagina = (paginaActual: number) => {
    const footerText = `Generado automáticamente por la Aplicación Móvil | Página ${paginaActual}`;
    doc.setFontSize(10);
    doc.setTextColor(150);
    const textWidth = doc.getTextWidth(footerText);
    const textX = (pageWidth - textWidth) / 2;
    doc.text(footerText, textX, doc.internal.pageSize.getHeight() - 10);
  };

  let currentPage = 1;
  agregarEncabezado();
  agregarDescripcion();

  // Capturar el gráfico de solicitudes
  const section = document.querySelector('#graficoSolicitudesAdopcion') as HTMLElement;

  if (section) {
    // Reducir la escala para mejorar el rendimiento
    html2canvas(section, { scale: 1, useCORS: true, backgroundColor: '#ffffff' }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 15 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgX = (pageWidth - imgWidth) / 2;

      // Verificar si la imagen cabe en la página actual
      if (imgHeight > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        currentPage++;
        agregarEncabezado();
        agregarDescripcion();
      }

      doc.addImage(imgData, 'PNG', imgX, 60, imgWidth, imgHeight);
      agregarPieDePagina(currentPage);

      // Guardar el PDF de manera progresiva para reducir la carga en la memoria
      const pdfBlob = doc.output('blob');

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;

        // Generar un nombre de archivo único con marca de tiempo
        const timestamp = new Date().getTime();
        const fileName = `Reporte_solicitudes_adopcion-${timestamp}.pdf`;

        // Guardar el archivo PDF en el sistema de archivos del dispositivo
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64data.split(',')[1], // Eliminar el prefijo 'data:application/pdf;base64,'
          directory: Directory.Documents,
        });

        console.log('Archivo guardado en:', savedFile.uri);
        await this.presentToast(`El archivo PDF ha sido guardado correctamente en Documentos`, 3000);
        this.loading = false;
      };

      reader.readAsDataURL(pdfBlob); // Convertir el Blob a Base64
    }).catch((error) => {
      console.error('Error al capturar la sección de gráfico:', error);
      this.loading = false;
    });
  } else {
    console.error('No se encontró el gráfico de solicitudes para exportar a PDF.');
    this.loading = false;
  }
}

async exportarReporteSolicitudesExcel() {
  this.loading = true;
  const workbook: XLSX.WorkBook = XLSX.utils.book_new();

  // Datos de encabezado y detalles de solicitudes
  const dataSolicitudes = [
    ['Reporte de Solicitudes de Adopción'], // Título del reporte
    [`Fecha del reporte: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`],
    ['Descripción: Este reporte proporciona información sobre el estado de las solicitudes de adopción registradas.'],
    [],
    ['Estado', 'Cantidad'], // Encabezados de columnas
    ['Aprobadas', this.totalSolicitudesAprobadas],
    ['Pendientes', this.totalSolicitudesPendientes],
    ['Rechazadas', this.totalSolicitudesRechazadas]
  ];

  const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataSolicitudes);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Solicitudes de Adopción');

  // Generar el archivo Excel en formato binario (ArrayBuffer)
  const excelBuffer: ArrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  try {
    // Convertir el ArrayBuffer a Base64
    const base64Data = this.arrayBufferToBase64(excelBuffer);

    // Generar un nombre de archivo único
    const timestamp = new Date().getTime();
    const fileName = `Reporte_solicitudes_adopcion-${timestamp}.xlsx`;

    // Guardar el archivo Excel en la carpeta 'Documents' del dispositivo móvil
    const result = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Documents,
    });

    console.log('Archivo guardado en:', result.uri);
    await this.presentToast('El archivo Excel ha sido guardado correctamente en Documentos.', 3000);
    this.loading = false;

  } catch (error) {
    console.error('Error al guardar el archivo Excel:', error);
    await this.presentToast('No se pudo guardar el archivo Excel.', 3000);
    this.loading = false;
  }
}

async imprimirReporteSolicitudes() {
  this.loading = true;
  const chartElement = document.querySelector('#graficoSolicitudesAdopcion') as HTMLElement;

  if (!chartElement) {
    console.error('No se encontró el gráfico de solicitudes para imprimir.');
    return;
  }

  // Crear un canvas personalizado con dimensiones de una hoja tamaño carta (8.5 x 11 pulgadas a 96 DPI)
  const cartaWidth = 816; // 8.5 pulgadas * 96 DPI
  const cartaHeight = 1056; // 11 pulgadas * 96 DPI
  const customCanvas = document.createElement('canvas');
  const ctx = customCanvas.getContext('2d');

  // Verificar si ctx no es null
  if (!ctx) {
    console.error('Error al obtener el contexto 2D del canvas.');
    return;
  }

  // Definir las dimensiones del nuevo canvas
  customCanvas.width = cartaWidth;
  customCanvas.height = cartaHeight;

  // Agregar encabezado
  ctx.fillStyle = '#1976D2'; // Color del encabezado
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Reporte de Solicitudes de Adopción', 20, 40); // Agregar título
  ctx.moveTo(10, 50);
  ctx.lineTo(cartaWidth - 10, 50);
  ctx.strokeStyle = '#1976D2';
  ctx.stroke(); // Dibujar línea

  // Agregar descripción y fecha/hora
  const fechaHora = new Date().toLocaleString();
  ctx.font = '12px Arial';
  ctx.fillStyle = '#000'; // Color de texto negro

  const descripcion = 'Este gráfico muestra la cantidad de solicitudes aprobadas, pendientes y rechazadas.';
  const maxWidth = cartaWidth - 40; // Margen de 20px a los lados
  const lineHeight = 20;

  // Función para envolver el texto y asegurarse de que no se salga de los márgenes
  function wrapText(text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx?.measureText(testLine); // Verificar si ctx existe antes de usarlo
      const testWidth = metrics?.width ?? 0;
      if (testWidth > maxWidth && i > 0) {
        ctx?.fillText(line, x, y); // Verificar si ctx existe antes de usarlo
        line = words[i] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx?.fillText(line, x, y); // Verificar si ctx existe antes de usarlo
  }

  wrapText(descripcion, 20, 80, maxWidth, lineHeight);
  ctx.fillText(`Fecha y hora de impresión: ${fechaHora}`, 20, 120);

  // Capturar el gráfico de solicitudes como imagen
  const canvasImgX = 20;
  const canvasImgY = 150;

  html2canvas(chartElement, { scale: 1, useCORS: true, backgroundColor: '#ffffff' }).then((canvas) => {
    const imgWidth = cartaWidth * 0.6; // Ajustar al 60% del ancho de la página
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Mantener la proporción de la imagen

    ctx.drawImage(canvas, canvasImgX, canvasImgY, imgWidth, imgHeight); // Colocar la imagen del gráfico

    // Agregar pie de página
    ctx.font = '10px Arial';
    ctx.fillStyle = '#999'; // Color gris para el pie de página
    ctx.fillText('Reporte generado automáticamente por la Aplicación Móvil', 20, cartaHeight - 30);

    // Convertir el canvas completo a imagen base64
    const finalImageData = customCanvas.toDataURL('image/png');
    const finalBase64Data = finalImageData.split(',')[1]; // Obtener solo los datos base64

    // Solicitar permisos de almacenamiento para Android
    if (this.platform.is('android')) {
      this.solicitarPermisoAlmacenamiento().then((permiso) => {
        if (!permiso) {
          console.error('Permiso de almacenamiento denegado');
          this.presentToast('Permiso de almacenamiento denegado.', 3000);
          return;
        }

        const timestamp = new Date().getTime(); // Generar un timestamp único
        const fileName = `Imagen_reporte_solicitudes-${timestamp}.png`; // Generar un nombre de archivo único

        // Guardar la imagen con el gráfico y el texto en el dispositivo móvil
        Filesystem.writeFile({
          path: fileName,
          data: finalBase64Data, // Los datos en base64
          directory: Directory.Documents,
        }).then((savedFile) => {
          console.log('Imagen guardada en:', savedFile.uri);
          this.presentToast('Imagen guardada correctamente en Documentos.', 3000);
          this.loading = false;
        }).catch((error) => {
          console.error('Error al guardar la imagen:', error);
          this.presentToast('Error al guardar la imagen.', 3000);
          this.loading = false;
        });
      });
    } else {
      console.error('Plataforma no compatible para permisos de almacenamiento.');
    }
  }).catch((error) => {
    console.error('Error al generar la imagen del gráfico de solicitudes:', error);
  });
}


async exportarReporteUsuariosPDF() {
  this.loading = true;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;

  // Solicitar permisos de almacenamiento para Android si es necesario
  if (this.platform.is('android')) {
    const permiso = await this.solicitarPermisoAlmacenamiento();
    if (!permiso) {
      console.error('Permiso de almacenamiento denegado');
      return;
    }
  }

  // Función para agregar encabezado
  const agregarEncabezado = () => {
    doc.setFontSize(18);
    doc.setTextColor('#1976D2');
    doc.setFont('helvetica', 'bold');
    const text = 'Reporte de Usuarios del Sistema por Rol';
    const textWidth = doc.getTextWidth(text);
    const textX = (pageWidth - textWidth) / 2;
    doc.text(text, textX, 20);
    doc.line(10, 25, 200, 25);
  };

  // Función para agregar descripción
  const agregarDescripcion = () => {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    const descripcion = 'Este reporte muestra la cantidad de usuarios en cada rol del sistema.';
    doc.text(descripcion, margin, 35, { maxWidth: pageWidth - 2 * margin });

    const fechaHora = new Date().toLocaleString();
    doc.text(`Fecha y hora de impresión: ${fechaHora}`, margin, 45);
  };

  // Función para agregar pie de página
  const agregarPieDePagina = (paginaActual: number) => {
    const footerText = `Generado automáticamente por la Aplicación Móvil | Página ${paginaActual}`;
    doc.setFontSize(10);
    doc.setTextColor(150);
    const textWidth = doc.getTextWidth(footerText);
    const textX = (pageWidth - textWidth) / 2;
    doc.text(footerText, textX, doc.internal.pageSize.getHeight() - 10);
  };

  let currentPage = 1;
  agregarEncabezado();
  agregarDescripcion();

  // Capturar la gráfica
  const section = document.querySelector('#graficoUsuariosPorRol') as HTMLElement;
  let currentY = 55;

  if (section) {
    // Reducir la escala para mejorar el rendimiento
    html2canvas(section, { scale: 1, useCORS: true, backgroundColor: '#ffffff' }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 15 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgX = (pageWidth - imgWidth) / 2;

      if (currentY + imgHeight > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage();
        currentPage++;
        agregarEncabezado();
        agregarDescripcion();
        currentY = 30;
      }

      doc.addImage(imgData, 'PNG', imgX, currentY, imgWidth, imgHeight);
      agregarPieDePagina(currentPage);

      // Guardar el PDF de manera progresiva para reducir la carga en la memoria
      const pdfBlob = doc.output('blob');

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;

        // Generar un nombre de archivo único con marca de tiempo
        const timestamp = new Date().getTime();
        const fileName = `Reporte_usuarios-${timestamp}.pdf`;

        // Guardar el archivo PDF en el sistema de archivos del dispositivo
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64data.split(',')[1], // Eliminar el prefijo 'data:application/pdf;base64,'
          directory: Directory.Documents,
        });

        console.log('Archivo guardado en:', savedFile.uri);
        await this.presentToast(`El archivo PDF ha sido guardado correctamente en Documentos`, 3000);
        this.loading = false;
      };

      reader.readAsDataURL(pdfBlob); // Convertir el Blob a Base64
    }).catch((error) => {
      console.error('Error al capturar la sección para el PDF:', error);
      this.loading = false;
    });
  } else {
    console.error('No se encontró la sección de gráfico para exportar a PDF.');
  }
}

async exportarReporteUsuariosExcel() {
  this.loading = true;
  const workbook = XLSX.utils.book_new();
  
  // Crear hoja con detalles de usuarios por rol
  const dataRoles = [
    ['Reporte de Usuarios por Rol'], // Título del reporte
    [`Fecha del reporte: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`],
    ['Descripción: Este reporte muestra la cantidad de usuarios en cada rol del sistema.'],
    [],
    ['Rol', 'Cantidad'], // Encabezados de columnas
    ['Admin', this.totalUsuariosAdmin],
    ['Usuario', this.totalUsuariosUsuario],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(dataRoles);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios por Rol');

  // Generar el archivo Excel en formato binario (ArrayBuffer)
  const excelBuffer: ArrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  try {
    // Convertir el ArrayBuffer a Base64
    const base64Data = this.arrayBufferToBase64(excelBuffer);

    // Generar un nombre de archivo único
    const timestamp = new Date().getTime();
    const fileName = `Reporte_usuarios-${timestamp}.xlsx`;

    // Guardar el archivo Excel en la carpeta 'Documents' del dispositivo móvil
    const result = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Documents,
    });

    console.log('Archivo guardado en:', result.uri);
    await this.presentToast('El archivo Excel ha sido guardado correctamente en Documentos.', 3000);
    this.loading = false;

  } catch (error) {
    console.error('Error al guardar el archivo Excel:', error);
    await this.presentToast('No se pudo guardar el archivo Excel.', 3000);
    this.loading = false;
  }
}

async imprimirReporteUsuarios() {
  this.loading = true;
  const chartElement = document.querySelector('#graficoUsuariosPorRol') as HTMLElement;

  if (!chartElement) {
    console.error('No se encontró la sección de gráfico para imprimir.');
    return;
  }

  // Crear un canvas personalizado con dimensiones de una hoja tamaño carta (8.5 x 11 pulgadas a 96 DPI)
  const cartaWidth = 816; // 8.5 pulgadas * 96 DPI
  const cartaHeight = 1056; // 11 pulgadas * 96 DPI
  const customCanvas = document.createElement('canvas');
  const ctx = customCanvas.getContext('2d');

  // Verificar si ctx no es null
  if (!ctx) {
    console.error('Error al obtener el contexto 2D del canvas.');
    return;
  }

  // Definir las dimensiones del nuevo canvas
  customCanvas.width = cartaWidth;
  customCanvas.height = cartaHeight;

  // Agregar encabezado
  ctx.fillStyle = '#1976D2'; // Color del encabezado
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Reporte de Usuarios del Sistema por Rol', 20, 40); // Agregar título
  ctx.moveTo(10, 50);
  ctx.lineTo(cartaWidth - 10, 50);
  ctx.strokeStyle = '#1976D2';
  ctx.stroke(); // Dibujar línea

  // Agregar descripción y fecha/hora
  const fechaHora = new Date().toLocaleString();
  ctx.font = '12px Arial';
  ctx.fillStyle = '#000'; // Color de texto negro

  const descripcion = 'Este reporte muestra la cantidad de usuarios en cada rol del sistema.';
  const maxWidth = cartaWidth - 40; // Margen de 20px a los lados
  const lineHeight = 20;

  // Función para envolver el texto y ajustarlo al ancho de la hoja
  function wrapText(text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx?.measureText(testLine); // Verificar si ctx existe antes de usarlo
      const testWidth = metrics?.width ?? 0;
      if (testWidth > maxWidth && i > 0) {
        ctx?.fillText(line, x, y); // Verificar si ctx existe antes de usarlo
        line = words[i] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx?.fillText(line, x, y); // Verificar si ctx existe antes de usarlo
  }

  wrapText(descripcion, 20, 80, maxWidth, lineHeight);
  ctx.fillText(`Fecha y hora de impresión: ${fechaHora}`, 20, 120);

  // Capturar el gráfico de usuarios por rol
  const canvasImgX = 20;
  const canvasImgY = 150;

  html2canvas(chartElement, { scale: 1, useCORS: true, backgroundColor: '#ffffff' }).then((canvas) => {
    const imgWidth = cartaWidth * 0.6; // Ajustar al 60% del ancho de la página
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Mantener la proporción de la imagen

    ctx.drawImage(canvas, canvasImgX, canvasImgY, imgWidth, imgHeight); // Colocar la imagen del gráfico

    // Agregar pie de página
    ctx.font = '10px Arial';
    ctx.fillStyle = '#999'; // Color gris para el pie de página
    ctx.fillText('Reporte generado automáticamente por la Aplicación Móvil', 20, cartaHeight - 30);

    // Convertir el canvas completo a imagen base64
    const finalImageData = customCanvas.toDataURL('image/png');
    const finalBase64Data = finalImageData.split(',')[1]; // Obtener solo los datos base64

    // Solicitar permisos de almacenamiento para Android
    if (this.platform.is('android')) {
      this.solicitarPermisoAlmacenamiento().then((permiso) => {
        if (!permiso) {
          console.error('Permiso de almacenamiento denegado');
          this.presentToast('Permiso de almacenamiento denegado.', 3000);
          return;
        }

        const timestamp = new Date().getTime(); // Generar un timestamp único
        const fileName = `Imagen_reporte_usuarios-${timestamp}.png`; // Generar un nombre de archivo único

        // Guardar la imagen con el gráfico y el texto en el dispositivo móvil
        Filesystem.writeFile({
          path: fileName,
          data: finalBase64Data, // Los datos en base64
          directory: Directory.Documents,
        }).then((savedFile) => {
          console.log('Imagen guardada en:', savedFile.uri);
          this.presentToast('Imagen guardada correctamente en Documentos.', 3000);
          this.loading = false;
        }).catch((error) => {
          console.error('Error al guardar la imagen:', error);
          this.presentToast('Error al guardar la imagen.', 3000);
          this.loading = false;
        });
      });
    } else {
      console.error('Plataforma no compatible para permisos de almacenamiento.');
    }
  }).catch((error) => {
    console.error('Error al generar la imagen del gráfico de usuarios:', error);
  });
}


  calcularTiempoRespuesta(fechaInicio: Date, fechaFin: Date) {
    const diff = fechaFin.getTime() - fechaInicio.getTime();
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${dias} días`;
  }



  async presentPopover(ev: Event) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: true,
    });
    await popover.present();
    const { data } = await popover.onWillDismiss();
    if (data) {
      this.selectedSegment = data;
    }
  }

  selectSegment(segment: string) {
    this.selectedSegment = segment;
    this.popoverController.dismiss();
  }

  async eliminarPublicacion(publicacion: any) {
    const alert = await this.alertController.create({
      header: 'Eliminar Publicación',
      message: '¿Estás seguro de que deseas eliminar esta publicación?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.firestore.collection('publicaciones').doc(publicacion.id).delete().then(() => {
              this.obtenerPublicaciones();
            });
          },
        },
      ],
    });
    await alert.present();
  }




  async openUpdateModal(publicacion: any) {
    // Clona la publicación para evitar problemas de referencia.
    const publicacionClone = JSON.parse(JSON.stringify(publicacion));
  
    // Asegúrate de que los datos del donante estén completos antes de abrir el modal.
    if (!publicacionClone.donante) {
      publicacionClone.donante = {
        nombre: '',
        direccion: '',
        numeroContacto: ''
      };
    }
  
    const modal = await this.modalCtrl.create({
      component: UpdatePublicacionModalComponent,
      componentProps: { publicacion: publicacionClone },
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.actualizarPublicacion(publicacion.id, result.data);
      }
    });
  
    return await modal.present();
  }
  


  async actualizarPublicacion(id: string, data: any) {
    try {
      // Aquí se actualiza solo la información de la mascota en la publicación
      await this.firestore.collection('publicaciones').doc(id).update({
        mascota: data.mascota
      });
      this.obtenerPublicaciones(); // Refresca la lista de publicaciones
    } catch (error) {
      console.error('Error al actualizar la información de la mascota:', error);
    }
  }
  



  async presentRoleChangeOptions(usuario: any) {
    const alert = await this.alertController.create({
      header: 'Cambiar de Rol',
      message: `Seleccione el nuevo rol para ${usuario.name}`,
      inputs: [
        {
          name: 'role',
          type: 'radio',
          label: 'Administrador',
          value: 'admin',
          checked: usuario.role === 'admin',
        },
        {
          name: 'role',
          type: 'radio',
          label: 'Usuario',
          value: 'user',
          checked: usuario.role === 'user',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Cambiar',
          handler: (nuevoRol) => {
            this.confirmarCambioRol(usuario, nuevoRol);
          },
        },
      ],
    });
  
    await alert.present();
  }


  // Confirmar eliminación del usuario
 // Confirmar eliminación del usuario
async confirmarEliminacionUsuario(usuario: any) {
  // Verificar si el usuario que se quiere eliminar es el usuario logueado
  const currentUser = await this.afAuth.currentUser;

  if (currentUser && currentUser.uid === usuario.uid) {
    // Mostrar una alerta indicando que no se puede eliminar a sí mismo
    const alert = await this.alertController.create({
      header: 'Acción no permitida',
      message: 'No puedes eliminar tu propia cuenta.',
      buttons: ['OK'],
    });
    await alert.present();
    return; // Detener la ejecución
  }

  // Si no es el usuario actual, mostrar la alerta de confirmación de eliminación
  const alert = await this.alertController.create({
    header: 'Confirmar Eliminación',
    message: `¿Estás seguro de que deseas eliminar al usuario "${usuario.name}"?`,
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Eliminar',
        handler: () => {
          this.eliminarUsuario(usuario); // Llamar al método de eliminación
        },
      },
    ],
  });

  await alert.present();
}


  async eliminarUsuario(usuario: any) {
    console.log('Datos del usuario antes de eliminar:', usuario); // Verifica los datos del usuario
    
    if (usuario?.uid) {
      try {
        // Intentar eliminar primero en Firestore
        await this.firestore.collection('users').doc(usuario.uid).delete();
        console.log(`Usuario ${usuario.name} eliminado exitosamente de Firestore.`);
        
        // Eliminar al usuario actual de Firebase Authentication (si está autenticado)
        const currentUser = await this.afAuth.currentUser;
        if (currentUser && currentUser.uid === usuario.uid) {
          await currentUser.delete();
          console.log(`Usuario ${usuario.name} eliminado exitosamente de Firebase Authentication.`);
        } else {
          console.log('El usuario no está autenticado o no coincide con el usuario actual.');
        }

        this.obtenerUsuarios(); // Refrescar la lista de usuarios
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      }
    } else {
      console.error('ID de usuario no válido.');
    }
  }



  

  async cambiarRolUsuario(usuario: any, nuevoRol: string) {
    if (!usuario || !usuario.uid) {
      console.error('El ID del usuario no es válido.');
      return; // Detener la ejecución si no hay un UID válido.
    }
  
    if (usuario.role === nuevoRol) {
      console.log(`El rol del usuario ${usuario.name} ya es ${nuevoRol}.`);
      return; // Detener si el rol no ha cambiado.
    }
  
    try {
      // Actualizar el rol en Firestore.
      await this.firestore.collection('users').doc(usuario.uid).update({ role: nuevoRol });
      console.log(`Rol del usuario ${usuario.name} cambiado a ${nuevoRol}.`);
  
      // Refrescar la lista de usuarios.
      this.obtenerUsuarios();
    } catch (error) {
      console.error('Error al cambiar el rol del usuario:', error);
    }
  }

  async mostrarSelectorRol(usuario: any) {
    if (!usuario || !usuario.uid) {
      console.error('El ID del usuario no es válido.');
      return;
    }
  
    const alert = await this.alertController.create({
      header: 'Cambiar Rol',
      inputs: [
        {
          name: 'role',
          type: 'radio',
          label: 'Administrador',
          value: 'admin',
          checked: usuario.role === 'admin', // Marcar si ya tiene este rol
        },
        {
          name: 'role',
          type: 'radio',
          label: 'Usuario',
          value: 'user',
          checked: usuario.role === 'user', // Marcar si ya tiene este rol
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cambio de rol cancelado');
          },
        },
        {
          text: 'Aceptar',
          handler: (nuevoRol) => {
            if (nuevoRol !== usuario.role) {
              this.confirmarCambioRol(usuario, nuevoRol);
            } else {
              console.log('El rol seleccionado es el mismo que ya tiene.');
            }
          },
        },
      ],
    });
  
    await alert.present();
  }
  
  async confirmarCambioRol(usuario: any, nuevoRol: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar Cambio de Rol',
      message: `¿Estás seguro de que deseas cambiar el rol de ${usuario.name} a ${nuevoRol}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cambio de rol cancelado.');
          },
        },
        {
          text: 'Aceptar',
          handler: async () => {
            try {
              await this.firestore.collection('users').doc(usuario.uid).update({ role: nuevoRol });
              console.log(`Rol de ${usuario.name} cambiado a ${nuevoRol}.`);
              this.obtenerUsuarios(); // Refrescar lista de usuarios
            } catch (error) {
              console.error('Error al cambiar el rol del usuario:', error);
            }
          },
        },
      ],
    });
  
    await alert.present();
  }
  
 
  logout() {
    this.fireService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}

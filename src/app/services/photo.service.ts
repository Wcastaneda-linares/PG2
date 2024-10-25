import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AngularFireStorage } from '@angular/fire/compat/storage'; // Asegúrate de importar AngularFireStorage
import { finalize } from 'rxjs/operators'; // Asegúrate de importar finalize


@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  constructor(private storage: AngularFireStorage) {} 
  async tomarFoto(): Promise<string | undefined> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });
      return image?.dataUrl;
    } catch (error) {
      console.error('Error al tomar la foto', error);
      return undefined;
    }
  }

    // Seleccionar imagen desde galería y subirla a Firebase Storage
    async seleccionarImagenDesdeGaleria(userId: string): Promise<string | undefined> {
      try {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri, // Obtiene la imagen como URI (ruta del archivo)
          source: CameraSource.Photos, // Abre la galería
        });
  
        if (image && image.webPath) {
          const response = await fetch(image.webPath);
          const blob = await response.blob(); // Convierte el archivo a Blob
  
          const filePath = `mascotas/${userId}_${new Date().getTime()}.jpeg`; // Ruta de almacenamiento
          const fileRef = this.storage.ref(filePath);
          const task = this.storage.upload(filePath, blob); // Subir la imagen como Blob
  
          return new Promise((resolve, reject) => {
            task.snapshotChanges()
              .pipe(
                finalize(() => {
                  fileRef.getDownloadURL().subscribe(
                    (url: string) => resolve(url),  // Retorna la URL pública de la imagen
                    (error) => {
                      console.error('Error al obtener la URL de descarga:', error);
                      reject(error);
                    }
                  );
                })
              )
              .subscribe({
                error: (uploadError) => {
                  console.error('Error al subir la imagen:', uploadError);
                  reject(uploadError);
                }
              });
          });
        }
  
        return undefined; // Retornar undefined si no hay imagen o no se subió
      } catch (error) {
        console.error('Error al seleccionar o subir la imagen:', error);
        return undefined; // Retornar undefined en caso de error
      }
    }


}

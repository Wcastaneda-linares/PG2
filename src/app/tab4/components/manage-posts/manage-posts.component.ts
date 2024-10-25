import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-manage-posts',
  templateUrl: './manage-posts.component.html',
  styleUrls: ['./manage-posts.component.scss'],
})
export class ManagePostsComponent implements OnInit {

  posts: any[] = [];  // Lista de publicaciones, esto debería venir de un servicio

  constructor() { }

  ngOnInit() {
    // Aquí puedes cargar la lista de publicaciones
  }

  deletePost(postId: string) {
    // Lógica para eliminar una publicación
  }

  editPost(postId: string) {
    // Lógica para editar una publicación
  }

}

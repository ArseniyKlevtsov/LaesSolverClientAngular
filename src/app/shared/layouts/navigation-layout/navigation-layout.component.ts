import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { WebsocketLltServiceService } from '../../services/websocket-llt.service.service';

@Component({
  selector: 'app-navigation-layout',
  standalone: true,
  imports: [NgFor, RouterModule, NgClass],
  templateUrl: './navigation-layout.component.html',
  styleUrl: './navigation-layout.component.css'
})

export class NavigationLayoutComponent {
  isConnected: boolean = false;

  constructor(private websocketService: WebsocketLltServiceService) {
    this.isConnected = this.websocketService.isConnected;

    this.websocketService.onOpen.subscribe(() => {
      this.isConnected = true;
    });

    this.websocketService.onClose.subscribe(() => {
      this.isConnected = false;
    });
  }

  reconnect() {
    this.websocketService.connect();
  }

  menuItems = [
    { url: '/smallMatrixSolver', name: 'Small Matrix' },
    { url: '/bigMatrixSolver', name: 'Big Matrix' },
    { url: '/savedTasks', name: 'Saved big matrix tasks' },
  ];
}

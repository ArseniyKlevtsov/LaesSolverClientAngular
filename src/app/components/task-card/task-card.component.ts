import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TaskInfoDto } from '../../shared/interfaces/DTOs/Response/task-info-dto.interface';
import { WebsocketLltService } from '../../shared/services/websocket-llt.service.service';
import { NgIf } from '@angular/common';
import { Message } from '../../shared/interfaces/value-objects/message';
import { MatrixTaskStorageService } from '../../shared/services/matrix-task-storage.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [NgIf],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css'
})
export class TaskCardComponent implements OnInit {
  @Input() taskInfo!: TaskInfoDto;
  @Output() deleteTask = new EventEmitter<string>();
  outdatedTaskInfo: TaskInfoDto | null = null;
  currentTaskInfo: TaskInfoDto | null = null;

  infoRequested: boolean = false;
  isNotFound: boolean = false;

  private messageSubscription!: Subscription;

  constructor(
    private websocketService: WebsocketLltService, private router: Router) { }

  ngOnInit(): void {
    this.messageSubscription = this.websocketService.onMessage.subscribe((message) => {
      if (message.Command === "TaskInfo" && this.infoRequested) {
        this.infoRequested = false;
        const taskInfoDto: TaskInfoDto = message.Dto;
        if (taskInfoDto.TaskName === this.taskInfo.TaskName) {
          this.currentTaskInfo = taskInfoDto;
          this.outdatedTaskInfo = null;
        } else {
          this.outdatedTaskInfo = taskInfoDto;
          this.currentTaskInfo = null;
        }
      }
      if (message.Command === "Error")
        this.ErrorHandler(message);
    });
  }

  private ErrorHandler(message: Message): void {
    if(this.infoRequested && message.Dto.ErrorMessage == "Access denied") {
      this.infoRequested = false;
      this.outdatedTaskInfo = this.taskInfo;
      this.currentTaskInfo = null;
    }
  }

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  onInfoClick() {
    const message: Message = {
      Command: "GetTaskStatus",
      Dto: {
        TaskKey: this.taskInfo.TaskKey,
        TaskName: this.taskInfo.TaskName
      }
    };
    this.infoRequested = true;
    this.websocketService.sendMessage(message);
  }


  onOpenInManagerClick() {
    this.router.navigate(['/bigMatrixSolver', this.taskInfo.TaskKey, this.taskInfo.TaskName]);
}

  onDeleteClick() {
    const message: Message = {
      Command: "DeleteTask",
      Dto: {
        TaskKey: this.taskInfo.TaskKey,
        TaskName: this.taskInfo.TaskName
      }
    };
    this.websocketService.sendMessage(message);
    this.deleteTask.emit(this.taskInfo.TaskName); 
  }
}

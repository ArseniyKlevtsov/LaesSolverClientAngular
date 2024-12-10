import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Message } from '../../shared/interfaces/value-objects/message';
import { WebsocketLltService } from '../../shared/services/websocket-llt.service.service';
import { MatrixTaskStorageService } from '../../shared/services/matrix-task-storage.service';
import { TaskInfoDto } from '../../shared/interfaces/DTOs/Response/task-info-dto.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-big-matrix-solver-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './big-matrix-solver-page.component.html',
  styleUrl: './big-matrix-solver-page.component.css'
})
export class BigMatrixSolverPageComponent implements OnInit, OnDestroy {
  taskKey: string = '';
  taskName: string = '';
  taskExist: boolean = false;
  taskSolved: boolean = false;

  logMessages: string[] = [];

  private messageSubscription!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private websocketService: WebsocketLltService,
    private matrixTaskStorageService: MatrixTaskStorageService) { }

  ngOnInit() {
    this.messageSubscription = this.websocketService.onMessage.subscribe((message: Message) => {
      this.handleMessage(message);
    });
    this.route.params.subscribe(params => {
      this.taskKey = params['taskKey'] || '';
      this.taskName = params['taskName'] || '';
    });
  }

  private handleMessage(message: Message): void {
    if (message.Command === "StartSendingAccepted")
      this.StartSendingAcceptedHandler(message);
  }

  private StartSendingAcceptedHandler(message: Message): void {
    if (message.Command === "StartSendingAccepted") {
      const dto = message.Dto;
      const taskInfo: TaskInfoDto = {
        RowCount: dto.RowCount,
        TaskName: dto.TaskName,
        TaskKey: dto.TaskKey,
        ReceivedRows: [],
        Solved: false
      };
      this.matrixTaskStorageService.addTask(taskInfo)
      this.log("Task created:");
      this.log("\t Task Name: " + dto.TaskName);
      this.log("\t Task Key: " + dto.TaskKey);
      this.log("\t Row Count: " + dto.RowCount,);
      this.taskName = dto.TaskName;
    }
  }

  onMatrixFileChange(event: any) {
    const file = event.target.files[0];
  }

  onVectorFileChange(event: any) {
    const file = event.target.files[0];
  }

  startSending() {
    const message: Message = {
      Command: "StartSendingBigMatrix",
      Dto: {
        VectorB: [10.0, 11.0, 12.0],
        TotalRows: 3,
        TaskKey: this.taskKey,
      }
    };
    this.websocketService.sendMessage(message);
  }

  getSolution() {
    console.log('Получение решения');

  }

  checkStatus() {
    console.log('Проверка статуса');
  }

  stopTask() {
    console.log('Остановка задачи');
  }

  resend() {
    console.log('Доотправка задачи');
  }

  startSolving() {
    console.log('startSolving');
  }

  log(message: string): void {
    this.logMessages.push(message);
  }

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
}

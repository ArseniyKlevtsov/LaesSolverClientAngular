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
  private matrixFileContent: number[][] = [];
  private vectorFileContent: number[] = [];

  taskKey: string = '';
  taskName: string = '';
  taskExist: boolean = false;

  taskInfo: TaskInfoDto | null = null;

  logMessages: string[] = [];

  canRequestSolving: boolean = false;
  canRequestSolution: boolean = false;

  isSendStarted: boolean = false;
  isSolveStarted: boolean = false;
  isGetSolutionRequested: boolean = false;
  isCheckStatusRequested: boolean = false;
  isStopActivated: boolean = true;
  isResendRequested: boolean = false;

  isMatrixLoaded: boolean = false;
  isVectorLoaded: boolean = false;

  private nextRowIndex: number = 0;
  private unsendedRows: number[] = [];

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
      if(params['taskName']) {
        this.isCheckStatusRequested = true;
        this.checkStatus();
      }
    });
  }

  private handleMessage(message: Message): void {
    if (message.Command === "StartSendingAccepted")
      this.StartSendingAcceptedHandler(message);
    if (message.Command === "TaskInfo")
      this.TaskInfoHandler(message);
    if (message.Command === "PartSaved")
      this.PartSavedHandler(message);
    if (message.Command === "TaskSolution")
      this.TaskSolutionHandler(message);
    if (message.Command === "TaskSolved")
      this.canRequestSolution=true;
  }

  private StartSendingAcceptedHandler(message: Message): void {
    const dto = message.Dto;
    const taskInfo: TaskInfoDto = {
      RowCount: message.Dto.RowCount,
      TaskName: message.Dto.TaskName,
      TaskKey: message.Dto.TaskKey,
      ReceivedRows: [],
      Solved: false
    };
    this.taskInfo = taskInfo;

    this.matrixTaskStorageService.addTask(taskInfo)

    this.log("Task created:");
    this.log("\t Task Name: " + taskInfo.TaskName);
    this.log("\t Task Key: " + taskInfo.TaskKey);
    this.log("\t Row Count: " + taskInfo.RowCount);
    console.log(dto)
    console.log(message.Dto)
    console.log(taskInfo.ReceivedRows)
    this.log("\t Received matrix rows: " + taskInfo.ReceivedRows.length + "/" + taskInfo.RowCount,);
    this.log("\t Solved: " + taskInfo.Solved,);
    this.taskName = taskInfo.TaskName;

    this.calculateUnsendedRows();
    this.sendNextRow();
  }

  private TaskInfoHandler(message: Message): void {
    const dto = message.Dto;
    const taskInfo: TaskInfoDto = {
      RowCount: dto.RowCount,
      TaskName: dto.TaskName,
      TaskKey: dto.TaskKey,
      ReceivedRows: dto.ReceivedRows,
      Solved: dto.Solved
    };
    if(taskInfo.Solved === true) {
      this.canRequestSolution = true;
    }
    this.taskInfo = taskInfo;
    if (this.isCheckStatusRequested) {
      this.isCheckStatusRequested = false;
      this.log("Task info:");
      this.log("\t Task Name: " + dto.TaskName);
      this.log("\t Task Key: " + dto.TaskKey);
      this.log("\t Row Count: " + dto.RowCount,);
      this.log("\t Received matrix rows: " + dto.ReceivedRows.length + "/" + dto.RowCount,);
      this.log("\t Solved: " + dto.Solved,);
    }
  }

  private sendNextRow() {
    const message: Message = {
      Command: "BigMatrixPart",
      Dto: {
        RowIndex: this.nextRowIndex,
        RowData: this.matrixFileContent[this.nextRowIndex],
        TaskKey: this.taskKey,
        taskName: this.taskName
      }
    };
    this.websocketService.sendMessage(message);
    this.log("Send row:" + (this.nextRowIndex+1) + "/" + this.taskInfo!.RowCount);
  }

  private calculateUnsendedRows(): number[] {
    if (!this.taskInfo) return [];

    const receivedRowsSet = new Set(this.taskInfo.ReceivedRows);

    this.unsendedRows = [];

    for (let i = 0; i < this.taskInfo.RowCount; i++) {
      if (!receivedRowsSet.has(i)) {
        this.unsendedRows.push(i);
      }
    }

    return this.unsendedRows;
  }

  private getNextUnsendedRow(): number | null {
    if (!this.unsendedRows || this.unsendedRows.length === 0) {
      return null;
    }

    const nextRow = this.unsendedRows[0];
    this.unsendedRows.splice(0, 1);
    return nextRow;
  }

  private PartSavedHandler(message: Message): void {
    const index = this.getNextUnsendedRow();
    if(index == null) {
      this.log("The sending of the rows is completed");
      this.log("You can request solving");
      this.canRequestSolving = true;
      return;
    }
    this.nextRowIndex = index;
    this.sendNextRow();
  }

  private TaskSolutionHandler(message: Message): void {
    const dto = message.Dto;
    const csvContent = this.convertVectorToCSV(dto.VectorX);
    this.downloadCSV(csvContent, `${dto.TaskName}.csv`);
}

private convertVectorToCSV(vector: number[]): string {
    return vector.join(',');
}

private downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

  onMatrixFileChange(event: any): void {
    const file = event.target.files[0];
    if (file && this.checkFile(file.name)) {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        const text = reader.result as string;
        this.parseMatrix(text);
        this.log('Matrix loaded');
        this.isMatrixLoaded = true;
      };
    } else {
      console.error('Invalid file format. Please upload a .csv file.');
    }
  }

  onVectorFileChange(event: any): void {
    const file = event.target.files[0];
    if (file && this.checkFile(file.name)) {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        const text = reader.result as string;
        this.parseVector(text);
        this.log('Vector loaded');
        this.isVectorLoaded = true;
      };
    } else {
      console.error('Invalid file format. Please upload a .csv file.');
    }
  }

  private checkFile(fileName: string): boolean {
    return fileName.endsWith('.csv');
  }

  private parseMatrix(text: string): void {
    const rows = text.split('\n');
    this.matrixFileContent = rows.map(row => row.split(',').map(Number));
  }

  private parseVector(text: string): void {
    this.vectorFileContent = text.split(',').map(Number);
  }

  startSending() {
    const message: Message = {
      Command: "StartSendingBigMatrix",
      Dto: {
        VectorB: this.vectorFileContent,
        TotalRows: this.vectorFileContent.length,
        TaskKey: this.taskKey,
      }
    };
    this.websocketService.sendMessage(message);
  }

  getSolution() {
    const message: Message = {
      Command: "GetSolution",
      Dto: {
        TaskKey: this.taskKey,
        TaskName: this.taskName
      }
    };
    this.websocketService.sendMessage(message);
  }

  checkStatus() {
    const message: Message = {
      Command: "GetTaskStatus",
      Dto: {
        TaskKey: this.taskKey,
        TaskName: this.taskName
      }
    };
    this.isCheckStatusRequested = true;
    this.websocketService.sendMessage(message);
  }

  stopTask() {
    this.isStopActivated = true;
    this.log('sending has been stopped');
    this.checkStatus();
  }

  resend() {
    this.isStopActivated = false;
    this.sendNextRow();
  }

  startSolving() {
    const message: Message = {
      Command: "StartSolving",
      Dto: {
        TaskKey: this.taskKey,
        TaskName: this.taskName
      }
    };
    this.websocketService.sendMessage(message);
    this.log("solving request sended");
    this.log("please wait until the task is completed");
  }

  log(message: string): void {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}.${now.getMinutes().toString().padStart(2, '0')}.${now.getSeconds().toString().padStart(2, '0')}: `;
    const fullMessage = timeString + message;

    const expectedFormat = /^\d{2}\.\d{2}\.\d{2}: Send row:/;
    const isNewMessageSendRow = message.startsWith("Send row:");

    if (this.logMessages.length > 0 && expectedFormat.test(this.logMessages[this.logMessages.length - 1]) && isNewMessageSendRow) {
        this.logMessages.pop();
    }

    this.logMessages.push(fullMessage);
}

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

}

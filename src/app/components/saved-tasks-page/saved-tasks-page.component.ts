import { Component, OnInit } from '@angular/core';
import { TaskInfoDto } from '../../shared/interfaces/DTOs/Response/task-info-dto.interface';
import { MatrixTaskStorageService } from '../../shared/services/matrix-task-storage.service';
import { NgFor } from '@angular/common';
import { TaskCardComponent } from '../task-card/task-card.component';

@Component({
  selector: 'app-saved-tasks-page',
  standalone: true,
  imports: [NgFor, TaskCardComponent],
  templateUrl: './saved-tasks-page.component.html',
  styleUrl: './saved-tasks-page.component.css'
})
export class SavedTasksPageComponent implements OnInit {
  tasks: TaskInfoDto[] = [];

  constructor(private taskStorageService: MatrixTaskStorageService) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks() {
    this.tasks = this.taskStorageService.getAllTasks();
  }

  deleteTask(taskName: string) {
    this.taskStorageService.deleteTask(taskName);
    this.tasks = this.tasks.filter(task => task.TaskName !== taskName);
}
}

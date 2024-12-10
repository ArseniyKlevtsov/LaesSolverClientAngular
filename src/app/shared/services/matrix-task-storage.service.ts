import { Injectable } from '@angular/core';
import { TaskInfoDto } from '../interfaces/DTOs/Response/task-info-dto.interface';

@Injectable({
  providedIn: 'root'
})
export class MatrixTaskStorageService {

  private storageKey: string = 'matrixTasks';

  constructor() { }

  getAllTasks(): TaskInfoDto[] {
    const tasks = localStorage.getItem(this.storageKey);
    return tasks ? JSON.parse(tasks) : [];
  }

  getTaskByName(taskName: string): TaskInfoDto | null {
    const tasks = this.getAllTasks();
    return tasks.find(task => task.TaskName === taskName) || null;
  }

  addTask(task: TaskInfoDto): void {
    const tasks = this.getAllTasks();
    tasks.push(task);
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
  }

  updateTask(updatedTask: TaskInfoDto): void {
    const tasks = this.getAllTasks();
    const index = tasks.findIndex(task => task.TaskName === updatedTask.TaskName);
    if (index !== -1) {
      tasks[index] = updatedTask;
      localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    }
  }

  deleteTask(TaskName: string): void {
    const tasks = this.getAllTasks();
    console.log("DELETE TASK")
    const updatedTasks = tasks.filter(task => task.TaskName !== TaskName);
    localStorage.setItem(this.storageKey, JSON.stringify(updatedTasks));
  }
}

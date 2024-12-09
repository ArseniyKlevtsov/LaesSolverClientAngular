import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-big-matrix-solver-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './big-matrix-solver-page.component.html',
  styleUrl: './big-matrix-solver-page.component.css'
})
export class BigMatrixSolverPageComponent implements OnInit  {
  taskKey: string = '';
  taskName: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.taskKey = params['taskKey'] || ''; 
      this.taskName = params['taskName'] || ''; 
    });
  }
  onMatrixFileChange(event: any) {
    const file = event.target.files[0];
  }

  onVectorFileChange(event: any) {
    const file = event.target.files[0];
  }

  startSending() {
    console.log('Начало отправки задач');
    console.log(this.taskKey);
    console.log(this.taskName);
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

  deleteTask() {
    console.log('Удаление задачи');
  }
}

import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { WebsocketLltServiceService } from '../../shared/services/websocket-llt.service.service';
import { Message } from '../../shared/interfaces/value-objects/message';

@Component({
  selector: 'app-small-matrix-solver-page',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, NgClass, NgStyle],
  templateUrl: './small-matrix-solver-page.component.html',
  styleUrl: './small-matrix-solver-page.component.css'
})
export class SmallMatrixSolverPageComponent implements OnInit {
  matrixSizes = Array.from({ length: 9 }, (_, i) => i + 2);
  matrixA: number[][] = [];
  vectorB: number[] = [];
  result: string | null = null;
  matrixSize: number = 2; // Начальный размер матрицы

  constructor(private websocketService: WebsocketLltServiceService) {
    this.initializeMatrices(2);
  }

  ngOnInit() {
    this.websocketService.onMessage.subscribe((message) => {
      if (message.Command === "SmallMatrixSolution") {
        const vectorX: number[] = message.Dto.VectorX;
        this.result = vectorX.map(value => value.toFixed(2)).join(', '); // Ограничиваем до 2 знаков
        console.log(vectorX);
      }
    });
  }

  onMatrixSizeChange(event: Event) {
    this.matrixSize = +(<HTMLSelectElement>event.target).value;
    this.initializeMatrices(this.matrixSize);
  }

  initializeMatrices(size: number) {
    const newMatrixA = Array.from({ length: size }, () => Array(size).fill(0));
    const newVectorB = Array(size).fill(0);

    for (let i = 0; i < Math.min(size, this.matrixA.length); i++) {
      for (let j = 0; j < Math.min(size, this.matrixA[i].length); j++) {
        newMatrixA[i][j] = this.matrixA[i][j];
      }
    }

    for (let i = 0; i < Math.min(size, this.vectorB.length); i++) {
      newVectorB[i] = this.vectorB[i];
    }

    this.matrixA = newMatrixA;
    this.vectorB = newVectorB;
  }

  getMatrixWidth(size: number): string {
    return `${(size / (size + 1)) * 100}%`; // Динамическое вычисление ширины для матрицы
  }

  getVectorWidth(size: number): string {
    return `${(1 / (size + 1)) * 100}%`; // Динамическое вычисление ширины для вектора
  }

  solve() {
    // Формируем объект запроса
    const message: Message = {
      Command: "SolveSmallMatrix",
      Dto: {
        Matrix: this.matrixA,
        VectorB: this.vectorB
      }
    };

    this.websocketService.sendMessage(message);

    // Для отображения в результате
    this.result = this.vectorB.join(', ');
    console.log('Решение:', this.matrixA, this.vectorB);
  }

  trackByIndex(index: number): number {
    return index;
  }
}

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BigMatrixSolverPageComponent } from './big-matrix-solver-page.component';

describe('BigMatrixSolverPageComponent', () => {
  let component: BigMatrixSolverPageComponent;
  let fixture: ComponentFixture<BigMatrixSolverPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BigMatrixSolverPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BigMatrixSolverPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

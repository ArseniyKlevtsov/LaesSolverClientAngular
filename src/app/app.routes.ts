import { Routes } from '@angular/router';

import { NavigationLayoutComponent } from './shared/layouts/navigation-layout/navigation-layout.component';

import { SmallMatrixSolverPageComponent } from './components/small-matrix-solver-page/small-matrix-solver-page.component';
import { BigMatrixSolverPageComponent } from './components/big-matrix-solver-page/big-matrix-solver-page.component';
import { SavedTasksPageComponent } from './components/saved-tasks-page/saved-tasks-page.component';

export const routes: Routes = [
    {
        path: '', component: NavigationLayoutComponent, children: [
            { path: '', redirectTo: '/smallMatrixSolver', pathMatch: "full" },
            { path: 'smallMatrixSolver', component: SmallMatrixSolverPageComponent },
            { path: 'bigMatrixSolver', component: BigMatrixSolverPageComponent },
            { path: 'savedTasks', component: SavedTasksPageComponent },
        ]
    },
];

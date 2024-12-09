import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedTasksPageComponent } from './saved-tasks-page.component';

describe('SavedTasksPageComponent', () => {
  let component: SavedTasksPageComponent;
  let fixture: ComponentFixture<SavedTasksPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavedTasksPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavedTasksPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

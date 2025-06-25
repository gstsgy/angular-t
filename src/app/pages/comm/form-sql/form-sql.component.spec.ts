import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormSqlComponent } from './form-sql.component';

describe('DictComponent', () => {
  let component: FormSqlComponent;
  let fixture: ComponentFixture<FormSqlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormSqlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormSqlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormRegisterColComponent } from './form-register-col.component';

describe('FormRegisterColComponent', () => {
  let component: FormRegisterColComponent;
  let fixture: ComponentFixture<FormRegisterColComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormRegisterColComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormRegisterColComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

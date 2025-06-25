import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnsComponent } from './btns.component';

describe('BtnsComponent', () => {
  let component: BtnsComponent;
  let fixture: ComponentFixture<BtnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtnsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

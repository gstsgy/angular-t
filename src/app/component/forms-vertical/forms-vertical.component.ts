import {
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  inject,
} from "@angular/core";
import {
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { FormsModel, FormsVerticalData } from "@model/forms";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzSwitchModule } from "ng-zorro-antd/switch";
import { NzSelectComponent } from "ng-zorro-antd/select";
import { NzRadioComponent, NzRadioGroupComponent } from "ng-zorro-antd/radio";
import { NzDatePickerComponent } from "ng-zorro-antd/date-picker";
import { NzTimePickerComponent } from "ng-zorro-antd/time-picker";
import { NzTreeSelectModule } from "ng-zorro-antd/tree-select";
import { CommonModule } from "@angular/common";
import { SmartTemplateDirective } from "@app/directive/SmartTemplateDirective";
import { FormsModule } from "@angular/forms";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzModalRef, NZ_MODAL_DATA } from "ng-zorro-antd/modal";
import { MyApiService } from "@service/my-api.service";

@Component({
  selector: "app-forms-vertical",
  standalone: true,
  imports: [
    NzInputModule,
    NzFormModule,
    ReactiveFormsModule,
    NzSwitchModule,
    NzSelectComponent,
    FormsModule,
    NzRadioGroupComponent,
    NzRadioComponent,
    NzDatePickerComponent,
    NzTimePickerComponent,
    NzTreeSelectModule,
    CommonModule,
    NzButtonModule,
  ],
  templateUrl: "./forms-vertical.component.html",
  styleUrl: "./forms-vertical.component.less",
})
export class FormsVerticalComponent {
  // @Input() // 明细控制
  // formCol: Array<FormsModel> = [];
  // 全局控制是否编辑
  @Input("disabled")
  disabled: boolean = false;

  okLoading: boolean = false;

  // @Input('form-validate')
  // validateForm: FormGroup = this.fb.group({}) ;
  @ContentChildren(SmartTemplateDirective)
  templates!: QueryList<SmartTemplateDirective>;

  constructor(private fb: NonNullableFormBuilder) {}
  readonly #modal = inject(NzModalRef);

  readonly nzModalData: FormsVerticalData = inject(NZ_MODAL_DATA);

  readonly myApi = inject(MyApiService);

  getErrorTip(name: string | null): string {
    return `${name} 是必填项!`;
  }

  getPlaceholder(name: string | null): string {
    return `请输入${name} `;
  }

  @Output()
  enter: EventEmitter<void> = new EventEmitter<void>();

  enterEvent() {
    this.enter.emit();
  }

  getFormCode(code: string) {
    const item = this.templates.find((item) => item.id === code);
    if (item) {
      return item.templateRef;
    }
    return null;
  }

  getDisabled(cols: FormsModel) {
    return this.disabled || !!cols.disable;
  }

  close() {
    this.#modal.close();
  }

 async ok() {
    this.okLoading = true;
    try {
      for (let it of this.nzModalData.formCol) {
        if (it.required && !it.value) {
          this.myApi.warning(`${it.label}不能为空`);
          return;
        }
      }

      await this.myApi.sleep(5000)
      
      this.myApi.success('提交成功');
      await this.myApi.sleep(500)
      this.#modal.close();
    } catch (error) {
    } finally {
      this.okLoading = false;
    }
  }
}

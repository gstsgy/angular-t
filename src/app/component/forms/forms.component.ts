import { Component, ContentChildren, EventEmitter, Input, Output, QueryList} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {FormsModel} from "@model/forms";
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzSwitchModule} from 'ng-zorro-antd/switch';
import {NzSelectComponent} from "ng-zorro-antd/select";
import {NzRadioComponent, NzRadioGroupComponent} from "ng-zorro-antd/radio";
import {NzDatePickerComponent} from "ng-zorro-antd/date-picker";
import {NzTimePickerComponent} from "ng-zorro-antd/time-picker";
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { CommonModule } from '@angular/common';
import { SmartTemplateDirective } from '@app/directive/SmartTemplateDirective';
import {FormsModule} from "@angular/forms";
@Component({
    selector: 'app-forms',
    standalone: true,
    imports: [NzInputModule, NzFormModule, ReactiveFormsModule, NzSwitchModule, NzSelectComponent,FormsModule,
        NzRadioGroupComponent, NzRadioComponent, NzDatePickerComponent, NzTimePickerComponent,NzTreeSelectModule,CommonModule],
    templateUrl: './forms.component.html',
    styleUrl: './forms.component.less'
})
export class FormsComponent  {
    @Input('form-cols') // 明细控制
    formCol: Array<FormsModel> = [];
    // 全局控制是否编辑
    @Input('disabled')
    disabled:boolean=false;

    // @Input('form-validate')
    // validateForm: FormGroup = this.fb.group({}) ;
    @ContentChildren(SmartTemplateDirective) templates!: QueryList<SmartTemplateDirective>;

    constructor(private fb: NonNullableFormBuilder) {
    }
   
    getErrorTip(name:string|null):string{
        return `${name} 是必填项!`;
    }

    getPlaceholder(name:string|null):string{
        return `请输入${name} `;
    }

    @Output()
    enter:EventEmitter<void>=new EventEmitter<void>();

    enterEvent(){
        this.enter.emit();
    }

    getFormCode(code:string){
        const item = this.templates.find(item=>item.id===code);
       if(item){
           return item.templateRef;
       }
       return null;
    }

    getDisabled(cols:FormsModel){
        return this.disabled || (!!cols.disable);
    }
}

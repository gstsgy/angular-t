import {Component, Input} from '@angular/core';
import {FormsComponent} from "@app/component/forms/forms.component";
import {BtnsComponent} from "@app/component/btns/btns.component";
import {GridsComponent} from "@app/component/grids/grids.component";
import { NzSpinModule } from 'ng-zorro-antd/spin';
@Component({
    selector: 'app-form-report',
    standalone: true,
    imports: [FormsComponent, BtnsComponent, GridsComponent,NzSpinModule],
    templateUrl: './form-report.component.html',
    styleUrl: './form-report.component.less'
})
export class FormReportComponent   {
  constructor() {
  }
  
  @Input('commonObjs')
  commonObjs: any = {}
}

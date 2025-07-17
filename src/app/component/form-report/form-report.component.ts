import {Component, Input, AfterViewInit, QueryList, ContentChildren} from '@angular/core';
import {FormsComponent} from "@app/component/forms/forms.component";
import {BtnsComponent} from "@app/component/btns/btns.component";
import {GridsComponent} from "@app/component/grids/grids.component";
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { SmartTemplateDirective } from '@app/directive/SmartTemplateDirective';
@Component({
    selector: 'app-form-report',
    standalone: true,
    imports: [FormsComponent, BtnsComponent, GridsComponent,NzSpinModule],
    templateUrl: './form-report.component.html',
    styleUrl: './form-report.component.less'
})
export class FormReportComponent implements AfterViewInit {

  constructor() {
  }
  @ContentChildren(SmartTemplateDirective) templates!: QueryList<SmartTemplateDirective>;

  @Input('commonObjs')
  commonObjs: any = {}

  ngAfterViewInit(): void {
  }

}

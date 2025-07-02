import { Component, OnInit } from '@angular/core';
import SearchFormModel from '@app/model/searchFormModel';
import { ActivatedRoute } from '@angular/router';
import { MyApiService } from '@app/service/my-api.service';
import { SmartTemplateDirective } from '@app/directive/SmartTemplateDirective';
import { BtnsComponent } from '@app/component/btns/btns.component';
import { FormsComponent } from '@app/component/forms/forms.component';
import { GridsComponent } from '@app/component/grids/grids.component';
import { NzModalService } from 'ng-zorro-antd/modal';
@Component({
  selector: 'app-form-register-col',
  standalone: true,
  imports: [BtnsComponent,
    FormsComponent,
    GridsComponent,SmartTemplateDirective],
  templateUrl: './form-register-col.component.html',
  styleUrl: './form-register-col.component.less'
})
export class FormRegisterColComponent  extends SearchFormModel implements OnInit{
  ngOnInit(): void {
  }
  constructor(public override myApi: MyApiService, public override route: ActivatedRoute,  private modal: NzModalService) {
    super(myApi, route);
  }

  override async beforeInitialization(): Promise<void> {
    this.formId = '1940282612390084610'
  }

  override afterInitialization(): void {
    this.btns = [
      {
        code: 'add',
        name: '新增',
        icon: 'plus',
        type: 'primary',  
      },
    ]
  }

  override btnClick(code: string): void {
    if (code === 'add') {
      this.addRow();
      return;
    } 
    super.btnClick(code);
  }

  addRow(){
    console.log(1111)
    this.data.push({
     
      "id": "",
      "formId": "1927905823869157377",
      "code": "",
      "label": "",
      "type": "",
      "isShow": 0,
      "disable": null,
      "required": null,
      "trigger": null,
      "optionModel": null,
      "defaultValue": null,
      "order": 0
    })
    this.data = [...this.data];
    this.searchQuery.total = this.data.length;
    //console.log(this.data)
  }
}

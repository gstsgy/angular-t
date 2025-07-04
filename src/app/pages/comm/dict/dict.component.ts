import {Component, TemplateRef, ViewChild} from '@angular/core';
import SearchFormModel from "@model/searchFormModel";
import {FormReportComponent} from "@app/component/form-report/form-report.component";
import {MyApiService} from "@service/my-api.service";
import {ActivatedRoute} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {NzColDirective, NzRowDirective} from "ng-zorro-antd/grid";
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from "ng-zorro-antd/form";
import {NzInputDirective} from "ng-zorro-antd/input";
import {NzSelectComponent} from "ng-zorro-antd/select";
import {NzModalModule, NzModalService} from "ng-zorro-antd/modal";
import {FormsModel} from "@model/forms";
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
@Component({
    selector: 'app-dict',
    standalone: true,
    imports: [
        NzModalModule,
        FormReportComponent,
        FormsModule,
        NzColDirective,
        NzFormControlComponent,
        NzFormDirective,
        NzFormItemComponent,
        NzFormLabelComponent,
        NzInputDirective,
        NzRowDirective,
        NzSelectComponent,
        NzInputNumberModule
    ],
    templateUrl: './dict.component.html',
    styleUrl: './dict.component.less'
})
export class DictComponent extends SearchFormModel {
    constructor(public override myApi: MyApiService, public override route: ActivatedRoute, private modal: NzModalService,) {
        super(myApi, route);
    }

    @ViewChild('dictForm') dictForm!: TemplateRef<{}> ;
    dictItem = {
        modelCode: null,
        dictKey: null,
        dictValue: null,
        seq:0
    }
    modelOptions:Array<{ value: string | number, label: string }> = []

    override btnClick(code: string) {
        if (code === 'add') {
            this.add();
            return;
        }else if(code === 'delete') {
            this.delete();
            return;
        }
        super.btnClick(code);
    }

    add() {
        this.dictItem = {
            modelCode: null,
            dictKey: null,
            dictValue: null,
            seq:0
        }
        this.modal.create({
            nzWidth: '640px',
            nzTitle: "选择按钮",
            nzContent: this.dictForm,
            nzClosable: true,
            nzOnOk: () => {
                this.myApi.post('dictionary/dict',this.dictItem).then(res=>{
                    if (res.code === 200) {
                        this.myApi.success("保存成功")
                        this.myApi.resetDict(this.dictItem.modelCode??"")
                    }
                })
            },
            nzCancelText: null
        });
    }

    override gotoSetForm(obj:{ row: any, col: FormsModel }){
        this.dictItem = obj.row;
        console.log(obj.row)
        this.modal.create({
            nzWidth: '640px',
            nzTitle: "选择按钮",
            nzContent: this.dictForm,
            nzClosable: true,
            // nzFooter: null,
            nzOnOk: () => {
                this.myApi.put('dictionary/dict',this.dictItem).then(res=>{
                    if (res.code === 200) {
                        this.myApi.success("保存成功")
                        this.myApi.resetDict(this.dictItem.modelCode??"")
                    }
                })
            },
            nzCancelText: null
        });
    }
    override afterInitialization() {
        this.myApi.getDict("9527").subscribe(res=>{
            this.modelOptions = res;
        })
    }

    delete(){
        if(this.selectData.length===0){
            this.myApi.warning("请勾选数据")
            return;
        }
        this.myApi.delete('dictionary/dicts',this.selectData).then(res=>{
            if(res.code === 200){
                this.myApi.success("删除成功");
                this.refresh();
            }
        })

    }
}

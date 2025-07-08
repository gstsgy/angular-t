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
import { NzCodeEditorModule } from 'ng-zorro-antd/code-editor';
import {NzDrawerComponent, NzDrawerRef, NzDrawerService,NzDrawerModule } from "ng-zorro-antd/drawer";
import {NzButtonComponent} from "ng-zorro-antd/button";
import { SmartTemplateDirective } from '@app/directive/SmartTemplateDirective';
import { AccEditorComponent } from '@app/component/ace-editor/ace-editor.component';
@Component({
    selector: 'app-form-sql',
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
        NzInputNumberModule,
        NzCodeEditorModule,
        NzDrawerComponent,
        NzDrawerModule,
        NzButtonComponent,
        SmartTemplateDirective,
        AccEditorComponent
    ],
    templateUrl: './form-sql.component.html',
    styleUrl: './form-sql.component.less'
})
export class FormSqlComponent extends SearchFormModel {
    constructor(public override myApi: MyApiService, public override route: ActivatedRoute, private drawerService: NzDrawerService,private modal: NzModalService) {
        super(myApi, route);
    }
    

    @ViewChild('sqlForm', { static: false }) sqlForm?: TemplateRef<{
        $implicit: { value: string };
        drawerRef: NzDrawerRef<string>;
    }>;
    sqlItem = {
        id: null,
        name: null,
        sql: '',
    }
    private drawerRef: NzDrawerRef<any, any> | undefined ;

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
        this.sqlItem = {
            id: null,
            name: null,
            sql: '',
        }
        this. drawerRef = this.drawerService.create({
            nzTitle: 'SQL编辑',
            nzWidth: '80%',
            nzContent: this.sqlForm,
        });
    }

    override gotoSetForm(obj:{ row: any, col: FormsModel }){
        this.sqlItem = obj.row;
        this. drawerRef = this.drawerService.create({
            nzTitle: 'SQL编辑',
            nzWidth: '80%',
            nzContent: this.sqlForm,
        });
    }
    
    delete(){
        if(this.selectData.length===0){
            this.myApi.warning("请勾选数据")
            return;
        }
        this.myApi.delete('formsql/item',this.selectData).then(res=>{
            if(res.code === 200){
                this.myApi.success("删除成功");
                this.refresh();
            }
        })

    }

    save(){
        if(this.sqlItem.id){
            this.myApi.put('formsql/item',this.sqlItem).then(res=>{
                if (res.code === 200) {
                    this.myApi.success("保存成功")
                    this.drawerRef?.close();
                    this.refresh();
                }
            })
        }else{
            this.myApi.post('formsql/item',this.sqlItem).then(res=>{
                if (res.code === 200) {
                    this.myApi.success("保存成功")
                    this.drawerRef?.close();
                    this.refresh();
                }
            })
        }
    }

    publish(){
        if(this.sqlItem.id){
            this.myApi.post('formsql/publish',this.sqlItem).then(res=>{
                if (res.code === 200) {
                    this.myApi.success("发布成功")
                    this.drawerRef?.close();
                    this.refresh();
                }
            })
        }else{
            this.myApi.warning("请先保存")
        }
    }
    unPublish(){
        if(this.sqlItem.id){
            this.myApi.post('formsql/un-publish',this.sqlItem).then(res=>{
                if (res.code === 200) {
                    this.myApi.success("取消发布成功")
                    this.drawerRef?.close();
                    this.refresh();
                }
            })
        }else{
            this.myApi.warning("请先保存")
        }
    }
  }

   

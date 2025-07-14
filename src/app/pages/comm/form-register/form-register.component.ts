import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import { ReactiveFormsModule} from '@angular/forms';
import {FormsModel,DataSource} from '@model/forms';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzModalModule, NzModalService} from 'ng-zorro-antd/modal';
import {NzFlexDirective} from "ng-zorro-antd/flex";
import {FormsModule} from '@angular/forms';
import {NzSwitchModule} from 'ng-zorro-antd/switch';
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop'
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzOptionComponent, NzSelectComponent} from "ng-zorro-antd/select";
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import SearchFormModel from '@app/model/searchFormModel';
import { ActivatedRoute } from '@angular/router';
import { MyApiService } from '@app/service/my-api.service';
import { SmartTemplateDirective } from '@app/directive/SmartTemplateDirective';

import { FormRegisterColComponent } from '../form-register-col/form-register-col.component';
import { NzDrawerModule, NzDrawerService } from 'ng-zorro-antd/drawer';
import { CommonModule } from '@angular/common';
import {FormReportComponent} from "@app/component/form-report/form-report.component";
@Component({
    selector: 'app-form-register',
    standalone: true,
    imports: [ 
        NzDrawerModule,
        CommonModule,
        FormReportComponent,ReactiveFormsModule, NzButtonModule, NzFormModule,
        NzIconModule, NzInputModule, NzTableModule, NzModalModule,
        NzFlexDirective, FormsModule, NzSwitchModule, CdkDropList,
        CdkDrag, NzCheckboxModule, NzSelectComponent, NzOptionComponent, NzTabsModule,SmartTemplateDirective],
    templateUrl: './form-register.component.html',
    styleUrl: './form-register.component.less',
})
export class FormRegisterComponent extends SearchFormModel implements OnInit {
    @ViewChild('form') formModel!: TemplateRef<{}>;
    formItem: any = {}
    cols: any[] = [];
    modelTitle: string = "";
    //formId: string = "";
    dataSource: DataSource = {
        type: 'dict',
        code: '',
    };
    defaultValueOptions: any[] = [
        {label: '用户编号', value: '_UserId'},
        {label: '用户名', value: '_UserName'},
        {label: '当前日期', value: '_DateNow'},
        {label: '当前时间', value: '_DateTimeNow'},
    ];
    defaultValueOptionsSource:  any[] = [
        {label: '用户编号', value: '_UserId'},
        {label: '用户名', value: '_UserName'},
        {label: '当前日期', value: '_DateNow'},
        {label: '当前时间', value: '_DateTimeNow'},
    ];

    importData={
        tableName:'',
        tableNames:[] as any[]
    }

    jsonTmp = '' as any;

    constructor(public override myApi: MyApiService, public override route: ActivatedRoute,  private modal: NzModalService,private drawerService: NzDrawerService) {
        super(myApi, route);
    }

    ngOnInit(): void {
        this.myApi.get('form/tables').then(res => {
            if (res.code === 200) {
                this.importData.tableNames=res.data;
            }
        });
        // this.commonObjs.colDblClick=(data:{ row: any, col: FormsModel })=>{
            
        // }
    }
    override gotoSetForm(data:{ row: any, col: FormsModel }) {
        this.editForm(this.formModel,data)
    }
    override btnClick(code: string) {
        if (code === 'add') {
            this.editForm(this.formModel,{row:{},col:null});
            return;
        } 
        super.btnClick(code);
    }
    

    onDefaultSearch(value: string){
        this.defaultValueOptions=[{label: value, value: value},...this.defaultValueOptionsSource]
    }

   
    import(){
        if(!this.importData.tableName){
            this.myApi.error("请选择表名");
            return;
        }
        this.myApi.confirm(`是否确认带出表${this.importData.tableName}的字段}`,()=>{
            this.myApi.get(`form/table-columns?tableName=${this.importData.tableName}`).then(res => {
                if (res.code === 200) {
                    console.log(res.data)
                    const filterCode: string[] = ['update_flag','effective','insert_ymd','insert_id','update_ymd','update_id']
                    const tmpArr = res.data.filter((it:any)=> filterCode.indexOf(it.columnName) === -1);
                    let length = this.cols.length
                    for(const item of tmpArr){
                           this.cols.push({
                            formId: this.formId,
                            order: length++,
                            code: item.columnName,
                            label: item.columnComment,
                            type: 'input'
                            })
                    }
                }
            });
        })
       
    }
    addRow() {
        const length = this.cols.length
        this.cols.push({
            formId: this.formId,
            order: length
        })
    }
    delete(item:any){
        this.myApi.confirm("确定删除吗？",()=>{
            this.myApi.delete('form/form', item).then(res => {
                if (res.code === 200) {
                    this.myApi.success("删除成功")
                    this.refresh()
                }
            })
        });
        
    }
    deleteItem(index: number): void {
       this.cols.splice(index,1)
    }

    save() {
        let url = this.modelTitle === '表格' ? "form/grids" : "form/cols";
        url+=`?formId=${this.formId}`;
        this.myApi.post(url, this.cols).then(res => {
            if (res.code === 200) {
                this.myApi.success("保存成功")
            }
        })
    }

    openModel(title: string, templateRef: TemplateRef<{}>, item: any) {
        // const modal = this.modal.create<FormRegisterColComponent>({
        //     nzTitle: title,
        //     nzWidth: '80%',
        //     nzContent: FormRegisterColComponent,
        //     nzClosable: true,
        //     nzFooter: null,
        //     nzOnOk: () => new Promise(resolve => setTimeout(resolve, 1000)),
        //   });
        //   const drawerRef = this.drawerService.create<FormRegisterColComponent, { value: string }, string>({
        //     nzTitle: title,
        //     nzWidth: '100%',
        //     //nzFooter: 'Footer',
        //     //nzExtra: 'Extra',
        //     nzContent: FormRegisterColComponent,
           
        //   });
        this.jsonTmp = '';
        this.modelTitle = title;
        this.formId = item.id;
        let url = this.modelTitle === '表格' ? "form/grids" : "form/cols";
        this.myApi.get(url, {formId: item.id}).then(res => {
            this.cols = res.data;
        })
        this.modal.create({
            nzWidth: '80%',
            nzTitle: this.modelTitle,
            nzContent: templateRef,
            nzClosable: true,
            nzFooter: null,
            nzOnOk: () => {
            },
            nzCancelText: null
        });
    }

    openModelByDataSource( templateRef: TemplateRef<{}>, item:FormsModel) {
        if(!item.optionModel){
            this.dataSource = {
                type: 'dict',
                code: '',
            }
        }else{
            this.dataSource = JSON.parse(item.optionModel);

            console.log(this.dataSource)
        }
       
        this.modal.create({
            nzWidth: '680px',
            nzTitle: "数据源设置",
            nzContent: templateRef,
            nzClosable: true,
            //nzFooter: null,
            nzOnOk: () => {
                item.optionModel = JSON.stringify(this.dataSource);
            },
            //nzCancelText: null
        });
    }
    addDataSourceRow(){
        if(!this.dataSource.dataSource){
            this.dataSource.dataSource = [];
        }
        this.dataSource.dataSource.push({value:'',label:''})
    }
    deleteDataSourceRow(i:number){
        this.dataSource.dataSource.splice(i, 1);
    }
    selectDataSourceRow(i:number){

        this.dataSource.type =i===0?'dict':i===1?'static':'api';
    }
    editForm(templateRef: TemplateRef<{}>, obj: { row: any, col: any }) {
        this.formItem = obj.row;
        this.modal.create({
            nzWidth: '640px',
            nzTitle: "表单",
            nzContent: templateRef,
            nzClosable: true,
            // nzFooter: null,
            nzOnOk: () => {
                if (this.formItem.id - 0 > 0) {
                    this.myApi.put("form/form", this.formItem).then(res => {
                        if (res.code === 200) {
                            this.myApi.success("保存成功")
                        }
                    })
                } else {
                    this.myApi.post("form/form", this.formItem).then(res => {
                        if (res.code === 200) {
                            this.myApi.success("新增成功")
                        }
                    })
                }

            },
            nzCancelText: null
        });
    }

    drop(event: CdkDragDrop<string[]>): void {
        console.log(event.previousIndex, event.currentIndex);
        moveItemInArray(this.cols, event.previousIndex, event.currentIndex);
        if (event.previousIndex !== event.currentIndex) {
            const [prevItem, currentItem] = [this.cols[event.previousIndex], this.cols[event.currentIndex]];

            // 交换 'order' 属性
            [prevItem.order, currentItem.order] = [currentItem.order, prevItem.order];
        }
        //this.cols = this.cols.map((item, index) => ({ ...item, order: index }));
    }

    // editBtn(templateRef: TemplateRef<{}>, item: any){
    //     this.btnsModel.forEach(it=>it.checked=false)
    //     this.formId = item.id;
    //     this.myApi.get('form/btns', {formId: item.id}).then(res => {
    //         if (res.code === 200) {
    //             res.data.forEach((it:any) => {
    //                 const item = this.btnsModel.find(i=>i.value===it.id);
    //                 if(item){
    //                     item.checked = true;
    //                 }
    //             })
    //         }
    //     })
    //     this.modal.create({
    //         nzWidth: '640px',
    //         nzTitle: "选择按钮",
    //         nzContent: templateRef,
    //         nzClosable: true,
    //         // nzFooter: null,
    //         nzOnOk: () => {
    //           const arr=  this.btnsModel.filter(it=>it.checked).map(it=>({
    //               btnId:it.value,
    //               formId:this.formId
    //           }));
    //           this.myApi.post(`form/btns?formId=${this.formId}`,arr).then(res=>{
    //               if (res.code === 200) {
    //                   this.myApi.success("保存成功")
    //               }
    //           })
    //         },
    //         nzCancelText: null
    //     });
    // }
     toJson(){
        this.jsonTmp = JSON.stringify(this.cols, null, 4);
     }
     parseJson(){
        this.cols = JSON.parse(this.jsonTmp);
        this.cols.forEach(it=>{
            it.id = null,
            it.formId = this.formId
        })
     }
     toHump(name:string) {
        return name.replace(/\_(\w)/g, function(all, letter){
            return letter.toUpperCase();
        });
    }
}
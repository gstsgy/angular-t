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
import { BtnsComponent } from '@app/component/btns/btns.component';
import { FormsComponent } from '@app/component/forms/forms.component';
import { GridsComponent } from '@app/component/grids/grids.component';
@Component({
    selector: 'app-form-register',
    standalone: true,
    imports: [ BtnsComponent,
        FormsComponent,
        GridsComponent,ReactiveFormsModule, NzButtonModule, NzFormModule,
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

    constructor(public override myApi: MyApiService, public override route: ActivatedRoute,  private modal: NzModalService) {
        super(myApi, route);
    }

    ngOnInit(): void {
        // this.formCol.forEach(item => {
        //     this.validateForm.addControl(item.code, this.fb.control(''));
        // })

        // this.myApi.get('btn/btns', {pageNum: 1, pageSize: 500}).then(res => {
        //     if (res.code === 200) {
        //         this.btnsModel = res.data.records.map((it: { name: any; id: any; })=>({label: it.name, value: it.id}));
        //     }
        // });
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
}
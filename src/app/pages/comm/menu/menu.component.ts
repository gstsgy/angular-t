import {Component, SimpleChange, SimpleChanges, TemplateRef, ViewChild} from '@angular/core';
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
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzTreeSelectModule} from 'ng-zorro-antd/tree-select';
import {NzCheckboxGroupComponent} from "ng-zorro-antd/checkbox";
import {NzButtonComponent} from "ng-zorro-antd/button";

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [NzModalModule,
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
        NzTreeSelectModule,
        NzInputNumberModule, NzCheckboxGroupComponent, NzButtonComponent],
    templateUrl: './menu.component.html',
    styles: ''
})
export class MenuComponent extends SearchFormModel {
    constructor(public override myApi: MyApiService, public override route: ActivatedRoute, private modal: NzModalService,) {
        super(myApi, route);
    }

    @ViewChild('menu') menuModel!: TemplateRef<{}>;

    menuItem = {
        id: null,
        name: "",
        parentId: '',
        ico: "",
        path: "",
        posi: "",
        type: 0,
        seq: 0,
        isLeaf: 1
    }
    typeOptions: Array<{ value: string | number, label: string }> = [];
    boolOptions: Array<{ value: string | number, label: string }> = [];
    menuTrees = []
    btnsModel:Array<{label:null|string,checked:undefined|boolean,value:any}> = [];

    override afterInitialization() {
        this.myApi.getDict("menuType").subscribe(res => {
            this.typeOptions = res;
        })
        this.myApi.getDict("boolean").subscribe(res => {
            this.boolOptions = res;
        })
        this.myApi.get('btn/btns', {pageNum: 1, pageSize: 500}).then(res => {
            if (res.code === 200) {
                this.btnsModel = res.data.records.map((it: { name: any; id: any; })=>({label: it.name, value: it.id}));
            }
        });
    }

    override btnClick(code: string) {
        if (code === 'add') {
            this.add();
            return;
        } else if (code === 'delete') {
            this.delete();
            return;
        }
        super.btnClick(code);
    }

    add() {
        this.menuItem = {
            id: null,
            name: "",
            parentId: '',
            ico: "",
            path: "",
            posi: "",
            type: 0,
            seq: 0,
            isLeaf: 1
        }
        this.getMenuTree();
        this.modal.create({
            nzWidth: '640px',
            nzTitle: "新增菜单",
            nzContent: this.menuModel,
            nzClosable: true,
            nzOnOk: () => {
                this.myApi.post('menu/menu', this.menuItem).then(res => {
                    if (res.code === 200) {
                        this.myApi.success("保存成功")
                    }
                })
            },
            nzCancelText: null,
        });
    }

    override gotoSetForm(obj: { row: any, col: FormsModel }) {
        this.menuItem = obj.row;
        this.getMenuTree();
        this.modal.create({
            nzWidth: '640px',
            nzTitle: "编辑菜单",
            nzContent: this.menuModel,
            nzClosable: true,
            // nzFooter: null,
            nzOnOk: () => {
                this.myApi.put('menu/menu', this.menuItem).then(res => {
                    if (res.code === 200) {
                        this.myApi.success("保存成功")
                    }
                })
            },
            nzCancelText: null
        });
    }

    delete() {
        if (this.selectData.length === 0) {
            this.myApi.warning("请勾选数据")
            return;
        }
        this.myApi.confirm("您是否确认删除？",()=>{
            this.myApi.delete('menu/menu', this.selectData).then(res => {
                if (res.code === 200) {
                    this.myApi.success("删除成功");
                    this.refresh();
                }
            })
        })
    }

    getMenuTree() {

        this.myApi.get('menu/tree', {type: this.menuItem.type}).then(res => {
            if (res.code === 200) {
                this.menuTrees = res.data;
            }
        })
    }

    editBtn(templateRef: TemplateRef<{}>) {
        this.btnsModel.forEach(it => it.checked = false)
        //this.formId = this.menuItem.id;
        this.myApi.get('form/btns', {formId: this.menuItem.id}).then(res => {
            if (res.code === 200) {
                res.data.forEach((it: any) => {
                    const item = this.btnsModel.find(i => i.value === it.id);
                    if (item) {
                        item.checked = true;
                    }
                })
            }
        })
        this.modal.create({
            nzWidth: '640px',
            nzTitle: "选择按钮",
            nzContent: templateRef,
            nzClosable: true,
            // nzFooter: null,
            nzOnOk: () => {
                const arr = this.btnsModel.filter(it => it.checked).map(it => ({
                    btnId: it.value,
                    formId: this.menuItem.id
                }));
                this.myApi.post(`form/btns?formId=${this.menuItem.id}`, arr).then(res => {
                    if (res.code === 200) {
                        this.myApi.success("保存成功")
                    }
                })
            },
            nzCancelText: null
        });
    }
}

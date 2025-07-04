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
import {NzDatePickerModule} from "ng-zorro-antd/date-picker";

@Component({
    selector: 'app-user',
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
        NzDatePickerModule,
        NzInputNumberModule, NzCheckboxGroupComponent, NzButtonComponent],
    templateUrl: './role.component.html',
    styles: ''
})
export class RoleComponent extends SearchFormModel {
    constructor(public override myApi: MyApiService, public override route: ActivatedRoute, private modal: NzModalService,) {
        super(myApi, route);
    }

    @ViewChild('user') menuModel!: TemplateRef<{}>;

    userItem = {
        id: null,
        name: '',
        desc: ''

    }

    usersModel: Array<{ label: null | string, checked: undefined | boolean, value: any }> = [];

    override afterInitialization() {
        this.myApi.get('userrole/allusers').then(res => {
            if (res.code === 200) {
                this.usersModel = res.data.map((it: { nickName: any; id: any; }) => ({label: it.nickName, value: it.id}));
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
        this.userItem = {
            id: null,
            name: '',
            desc: ''
        }
        this.modal.create({
            nzWidth: '640px',
            nzTitle: "新增角色",
            nzContent: this.menuModel,
            nzClosable: true,
            nzOnOk: () => {
                //this.userItem.birthday = this.myApi.dateFormat(this.userItem.birthday);
                this.myApi.post('role/role', this.userItem).then(res => {
                    if (res.code === 200) {
                        this.myApi.success("保存成功")
                    }
                })
            },
            nzCancelText: null,
        });
    }

    override gotoSetForm(obj: { row: any, col: FormsModel }) {
        this.userItem = obj.row;
        this.modal.create({
            nzWidth: '640px',
            nzTitle: "编辑角色",
            nzContent: this.menuModel,
            nzClosable: true,
            // nzFooter: null,
            nzOnOk: () => {

                this.myApi.put('role/role', this.userItem).then(res => {
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
        this.myApi.confirm("您是否确认删除？", () => {
            this.myApi.delete('role/role', this.selectData).then(res => {
                if (res.code === 200) {
                    this.myApi.success("删除成功");
                    this.refresh();
                }
            })
        })

    }

    editBtn(templateRef: TemplateRef<{}>) {
        if (!this.userItem.id) {
            this.myApi.warning("请先保存角色");
            return;
        }
        this.usersModel.forEach(it => it.checked = false)
        //this.formId = this.menuItem.id;
        this.myApi.get(`userrole/users?roleId=${this.userItem.id}`).then(res => {
            if (res.code === 200) {
                res.data.forEach((it: any) => {
                    const item = this.usersModel.find(i => i.value === it.userId);
                    if (item) {
                        item.checked = true;
                    }
                })
            }
        })
        this.modal.create({
            nzWidth: '640px',
            nzTitle: "设置角色",
            nzContent: templateRef,
            nzClosable: true,
            // nzFooter: null,
            nzOnOk: () => {
                const arr = this.usersModel.filter(it => it.checked).map(it => ({
                    id: it.value

                }));
                this.myApi.post(`userrole/userrole?roleId=${this.userItem.id}`, arr).then(res => {
                    if (res.code === 200) {
                        this.myApi.success("保存成功")
                    }
                })
            },
            nzCancelText: null
        });
    }
}

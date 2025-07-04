import {Component, SimpleChange, SimpleChanges, TemplateRef, ViewChild, AfterViewInit} from '@angular/core';
import SearchFormModel from "@model/searchFormModel";
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
import {SearchFormComponent} from "@app/pages/comm/search-form/search-form.component";
import {FormReportComponent} from "@app/component/form-report/form-report.component";
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
    templateUrl: './user.component.html',
    styles: ''
})
export class UserComponent extends SearchFormModel implements AfterViewInit {
    constructor(public override myApi: MyApiService, public override route: ActivatedRoute, private modal: NzModalService,) {
        super(myApi, route);
    }

    @ViewChild('user') menuModel!: TemplateRef<{}>;

    userItem = {
        id: null,
        code: "",
        nickName: '',
        email: "",
        position: "",
        gender: "",
        birthday: '' as any,
     
    }
   
    operatorGenders: Array<{ value: string | number, label: string }> = [];
    rolesModel:Array<{label:null|string,checked:undefined|boolean,value:any}> = [];

    override afterInitialization() {
       
        this.myApi.getDict("operatorGender").subscribe(res => {
            this.operatorGenders = res;
        })
        this.myApi.get('userrole/allroles').then(res => {
            if (res.code === 200) {
                this.rolesModel = res.data.map((it: { name: any; id: any; })=>({label: it.name, value: it.id}));
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
            code: "",
            nickName: '',
            email: "",
            position: "",
            gender: "",
            birthday: new Date(),
        }
        this.modal.create({
            nzWidth: '640px',
            nzTitle: "新增用户",
            nzContent: this.menuModel,
            nzClosable: true,
            nzOnOk: () => {
                //this.userItem.birthday = this.myApi.dateFormat(this.userItem.birthday);
                this.myApi.post('user/user', this.userItem).then(res => {
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
        this.userItem.birthday =this.myApi.dateParse( this.userItem.birthday);
        this.modal.create({
            nzWidth: '640px',
            nzTitle: "编辑用户",
            nzContent: this.menuModel,
            nzClosable: true,
            // nzFooter: null,
            nzOnOk: () => {
                this.userItem.birthday = this.myApi.dateFormat(this.userItem.birthday);
                this.myApi.put('user/user', this.userItem).then(res => {
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
            this.myApi.delete('user/user', this.selectData).then(res => {
                if (res.code === 200) {
                    this.myApi.success("删除成功");
                    this.refresh();
                }
            })
        })

    }

    editBtn(templateRef: TemplateRef<{}>) {
        if(!this.userItem.id){
          this.myApi.warning("请先保存用户");
          return;
        }
        this.rolesModel.forEach(it => it.checked = false)
        //this.formId = this.menuItem.id;
        this.myApi.get(`userrole/roles?userId=${this.userItem.id}`).then(res => {
            if (res.code === 200) {
                res.data.forEach((it: any) => {
                    const item = this.rolesModel.find(i => i.value === it.roleId);
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
                const arr = this.rolesModel.filter(it => it.checked).map(it => ({
                    id: it.value

                }));
                this.myApi.post(`userrole/roleuser?userId=${this.userItem.id}`, arr).then(res => {
                    if (res.code === 200) {
                        this.myApi.success("保存成功")
                    }
                })
            },
            nzCancelText: null
        });
    }

    ngAfterViewInit() {
        console.log('分页参数检查:', {
          total: this.searchQuery,
          dataLength: this.data
        });
      }
}

import {Component, OnInit, SimpleChange, SimpleChanges, TemplateRef, ViewChild} from '@angular/core';
import SearchFormModel from "@model/searchFormModel";
import {BtnsComponent} from "@app/component/btns/btns.component";
import {FormsComponent} from "@app/component/forms/forms.component";
import {GridsComponent} from "@app/component/grids/grids.component";
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
import {NzFormatEmitEvent, NzTreeComponent, NzTreeModule, NzTreeNodeOptions} from 'ng-zorro-antd/tree';

@Component({
    selector: 'app-user',
    standalone: true,
    imports: [NzModalModule,
        BtnsComponent,
        FormsComponent,
        GridsComponent,
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
        NzTreeModule,
        NzDatePickerModule,
        NzInputNumberModule, NzCheckboxGroupComponent, NzButtonComponent],
    templateUrl: './permission.component.html',
    styleUrl: './permission.component.less'
})
export class PermissionComponent implements OnInit {
    constructor(public myApi: MyApiService, private modal: NzModalService,) {

    }

    currentRoleId: any = null;

    menusNode: NzTreeNodeOptions[] = [];

    interfaceNode: NzTreeNodeOptions[] = [];
    defaultCheckedKeys:string[] = [];
    rolesModel: Array<{ label: null | string, checked: undefined | boolean, value: any }> = [];

    ngOnInit(): void {
        this.myApi.get('userrole/allroles').then(res => {
            if (res.code === 200) {
                this.rolesModel = res.data.map((it: { name: any; id: any; }) => ({label: it.name, value: it.id}));
            }
        });
        this.myApi.get('rolemenu/menutree?type=1').then(res => {
            if (res.code === 200) {
                this.menusNode = res.data;
            }
        });

        this.myApi.get('rolemenu/interfacetree').then(res => {
            if (res.code === 200) {
                this.interfaceNode = res.data;
            }
        });
    }

    onRoleChange() {
        this.defaultCheckedKeys=[];
        //console.log(this.currentRoleId);
        if (this.currentRoleId) {

            this.myApi.get(`rolemenu/menus?roleId=${this.currentRoleId}`).then(res => {
                if (res.code === 200) {
                   // console.log(res.data)
                    const btnIds: string[] = res.data.map((item: { menuId: string; }) => item.menuId);
                    this.setChecked(this.menusNode,btnIds);
                    this.defaultCheckedKeys = [...this.defaultCheckedKeys];

                }
            })
        }
    }

    save() {
        if (!this.currentRoleId) {
            this.myApi.warning("请先选择角色");
            return;
        }
        this.myApi.post(`rolemenu/rolemenu?roleId=${this.currentRoleId}`, this.getCheckBtn(this.menusNode)).then(res => {
            if (res.code === 200) {
                this.myApi.success("保存成功");
                this.currentRoleId = null;
                this.defaultCheckedKeys = [];
            }
        })
    }

    getCheckBtn(arr: NzTreeNodeOptions[]) {
        let resArr: string[] = []
        for (let arrKey of arr) {
            if (arrKey.isLeaf && arrKey.checked) {
                resArr.push(arrKey.key)
            }
            if (!arrKey.isLeaf && arrKey.children && arrKey.children.length > 0) {
                resArr.push(...this.getCheckBtn(arrKey.children))
            }
        }
        return resArr;
    }

    setChecked(arr: NzTreeNodeOptions[], btns: string[]) {
        for (let arrKey of arr) {
            if(btns.find(i=>i===arrKey.key)){
                this.defaultCheckedKeys.push(arrKey.key)
            }
            if (!arrKey.isLeaf && arrKey.children && arrKey.children.length > 0) {
                this.setChecked(arrKey.children,btns)
            }
        }
    }
}

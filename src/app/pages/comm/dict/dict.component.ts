import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {MyApiService} from "@service/my-api.service";
import {ActivatedRoute} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {NzInputDirective, NzInputGroupComponent} from "ng-zorro-antd/input";
import {NzModalModule, NzModalService} from "ng-zorro-antd/modal";
import {FormsModel} from "@model/forms";
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import {NzSpinComponent} from "ng-zorro-antd/spin";
import {NzTreeComponent} from "ng-zorro-antd/tree";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzIconDirective} from "ng-zorro-antd/icon";
import {NzPopconfirmDirective} from "ng-zorro-antd/popconfirm";
import {NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from "ng-zorro-antd/form";
import {NzColDirective} from "ng-zorro-antd/grid";
import {NzDropdownMenuComponent, NzContextMenuService, NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {NzMenuDirective, NzMenuItemComponent} from "ng-zorro-antd/menu";
@Component({
    selector: 'app-dict',
    standalone: true,
    imports: [
        NzModalModule,
        FormsModule,
        NzInputDirective,
        NzInputNumberModule,
        NzInputGroupComponent,
        NzSpinComponent,
        NzTreeComponent,
        NzButtonComponent,
        NzIconDirective,
        NzPopconfirmDirective,
        NzFormItemComponent,
        NzFormLabelComponent,
        NzColDirective,
        NzFormDirective,
        NzDropdownMenuComponent,
        NzMenuDirective,
        NzMenuItemComponent,
        NzDropDownModule
    ],
    templateUrl: './dict.component.html',
    styleUrl: './dict.component.less'
})
export class DictComponent  implements OnInit{
    searchValue:string = "";
    loading:boolean = false;
    nodes:any[] = [];
    showOperations:boolean = true;

    currentNode:any = null;
    constructor(public myApi: MyApiService, public  route: ActivatedRoute, private modal: NzModalService,private nzContextMenuService: NzContextMenuService) {

    }

    ngOnInit(): void {
        this.refresh();
    }

    convertToTreeNodes(data: any[]): any[] {
        return data.map((node: any) => ({
            key: node.id,
            title: node.label,
            value: node.value,
            model: node.model,
            isLeaf: !node.children || node.children.length === 0,
            children: node.children ? this.convertToTreeNodes(node.children) : [],
            icon: (!node.children || node.children.length === 0 )? 'file' : 'folder',
            expanded: node.expanded || false,
            disabled: node.disabled || false,
            selected: node.selected || false
        }))
    }

    @ViewChild('dictForm') dictForm!: TemplateRef<{}> ;
    dictItem = {
        id: null,
        parentId: null,
        modelCode: null as string  | null,
        dictKey: null,
        dictValue: null,
        seq:0
    }
    modelOptions:Array<{ value: string | number, label: string }> = []


    refresh(){
        this.myApi.get('dictionary/tree').then(res=>{
            if(res.code===200){
                this.nodes = this.convertToTreeNodes(res.data)
                console.log(this.nodes)
            }
        })
    }

    add(parentNode:any= null) {
        console.log(parentNode)
        this.dictItem = {
            id: null,
            parentId: parentNode.key,
            modelCode: parentNode.id===4?'':parentNode.origin.value,
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
                        this.myApi.resetDict(this.dictItem.modelCode??"");
                        this.refresh()
                    }
                })
            },
            nzCancelText: null
        });
    }

    edit(node:any){
        this.dictItem = {
            id: node.key,
            parentId: null,
            modelCode: node.origin.model,
            dictKey: node.origin.value,
            dictValue: node.origin.title,
            seq:0
        }
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
                        this.refresh()
                    }
                })
            },
            nzCancelText: null
        });
    }


    delete(node :any){
        this.myApi.confirm("确定删除吗？",()=>{
            this.myApi.delete('dictionary/dict?id='+node.key,).then(res=>{
                if(res.code === 200){
                    this.myApi.success("删除成功");
                    this.refresh();
                }
            })
        })
    }

    contextMenu($event: MouseEvent, menu: NzDropdownMenuComponent, node:any): void {
        this.currentNode = node;
        this.nzContextMenuService.create($event, menu);
    }

    copy(str:string){
        this.myApi.copy(str)
    }
}

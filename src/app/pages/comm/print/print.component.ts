import {AfterViewInit, Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {App, Rect, Ellipse, Text} from 'leafer-ui'
import { EditorEvent } from '@leafer-in/editor' // 导入图形编辑器插件 //
import { Ruler } from 'leafer-x-ruler'
import { Snap } from 'leafer-x-easy-snap'
import '@leafer-in/state' // 导入交互状态插件 //
import '@leafer-in/viewport'
import '@leafer-in/text-editor' // 导入文本编辑插件 //
import {NzButtonComponent, NzButtonGroupComponent} from "ng-zorro-antd/button";
import {NzIconDirective} from "ng-zorro-antd/icon";
import {NzCollapseComponent, NzCollapsePanelComponent} from "ng-zorro-antd/collapse";
import {NzTabComponent, NzTabSetComponent} from "ng-zorro-antd/tabs";
import {NzInputNumberComponent} from "ng-zorro-antd/input-number";
import {FormsModule} from "@angular/forms";
import {NzTreeComponent} from "ng-zorro-antd/tree";
import {MyApiService} from "@service/my-api.service"; // 导入视口插件 (可选)
import { NzInputModule } from 'ng-zorro-antd/input';
import {Table,QrCode} from "@model/print-model";
@Component({
  selector: 'app-print',
  standalone: true,
    imports: [
        NzButtonComponent,
        NzIconDirective,
        NzButtonGroupComponent,
        NzCollapseComponent,
        NzCollapsePanelComponent,
        NzTabSetComponent,
        NzTabComponent,
        NzInputNumberComponent,
        NzInputModule,
        FormsModule,
        NzTreeComponent
    ],
  templateUrl: './print.component.html',
  styleUrl: './print.component.less'
})
export class PrintComponent implements AfterViewInit{
    //@ViewChild('tools') tools!: ElementRef<HTMLElement> ;
    @ViewChild('leafer') leafer!: ElementRef<HTMLElement> ;

    dataSourceTree = [
        {
            title: '用户信息',
            key: 'user',
            children: [
                { title: '姓名', key: 'userName', isLeaf: true },
                { title: '年龄', key: 'age', isLeaf: true },
                { title: '邮箱', key: 'email', isLeaf: true }
            ]
        },
        {
            title: '订单信息',
            key: 'order',
            children: [
                { title: '订单号', key: 'orderId', isLeaf: true },
                { title: '金额', key: 'amount', isLeaf: true },
                { title: '时间', key: 'createTime', isLeaf: true }
            ]
        }
    ];
    selectItem: any={
        type: 'window',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        color:''
    };
    private app!: App;
    constructor(public  myApi: MyApiService,) { }



    ngAfterViewInit(): void {

        // 创建应用
        this. app = new App({ view: 'leafer', fill: '#aaa', editor: {
                keyEvent:true,
                multipleSelect:true
            } ,tree: { type: 'design' },wheel: { disabled: true },})
            const table = new Table(3, 4); // 3行4列
            this.app.tree.add(table)
        this.app.editor.on(EditorEvent.SELECT, (e: EditorEvent) => {
                if (this.app?.editor.leafList.list.length>0) {
                    this.selectItem.type = this.app.editor.leafList.list[0].tag
                    this.selectItem.width = this.app.editor.leafList.list[0].width;
                    this.selectItem.height = this.app.editor.leafList.list[0].height;
                    this.selectItem.x = this.app.editor.leafList.list[0].x;
                    this.selectItem.y = this.app.editor.leafList.list[0].y;
                }else{
                    this.selectItem.type = 'window'
                    this.selectItem.width = this.app?.width;
                    this.selectItem.height = this.app?.height;
                }
        });
        this.selectItem.width = this.app?.width;
        this.selectItem.height = this.app?.height;
        const ruler = new Ruler(this. app)
        const snap = new Snap(this. app)
// 启用
        snap.enable(true)
        //this. app .tree.add({ tag: 'Text', x: 100, y: 100, text: '可拖拽上方图形到这里', fill: '#999', fontSize: 16 })
        //console.log(this.tools.nativeElement)
       const tools =  document.querySelectorAll('.tool-item');
       //console.log(this.tools.nativeElement)
        for (let i = 0; i < tools.length; i++) {
            tools[i].addEventListener('dragstart',  (e: any)=> {
                e.dataTransfer.setData("type", tools[i].getAttribute('name'))
            })
        }


// 让画布可以接收拖拽内容
        this.leafer.nativeElement.addEventListener('dragover', function (e: any) {
            e.preventDefault()
        })

// 拖拽释放，创建相应图形
        this.leafer.nativeElement.addEventListener('drop',  (e: any)=> {
            const type = e.dataTransfer.getData("type")
            const point = this.app.getPagePointByClient(e) // 浏览器原生事件的 client 坐标 转 应用的 page 坐标
            if (type === 'rect') {
                this.app.tree.add(Rect.one({ fill: '#32cd79', editable: true }, point.x, point.y))
            } else if (type === 'circle') {
                this.app.tree.add(Ellipse.one({ fill: '#32cd79', editable: true, event: {
                    },}, point.x, point.y))
            }
            else if (type === 'line') {
                const qr = new QrCode({
                    content: 'https://leaferjs.com',
                    size: 150,
                    x: point.x,
                    y: point.y
                  });
                  
                 // app.add(qr);
                this.app.tree.add(qr)
            }
            else if (type === 'text') {
                this.app.tree.add(Text.one({  editable: true,fill: '#32cd79',placeholder: '输入文本',}, point.x, point.y))
            }
        })


    }

    @HostListener('document:keydown', ['$event'])
    handleGlobalKeyDown(event: KeyboardEvent) {
        if( event.key === 'Delete'){
            if (this.app?.editor.leafList.list.length>0) {
                this.app?.editor.leafList.list[0].destroy();
            }
        }
        if (event.ctrlKey && event.key.toLowerCase() === 'v') {
            this.myApi.readClipboard().then(res=>{
                if(res){
                   const json = JSON.parse( res);
                    json.x +=10;
                    json.y +=10;
                    this.app.tree.add(json)
                    this.myApi.copy(JSON.stringify(json))
                }
            })
        }
        if (event.ctrlKey && event.key.toLowerCase() === 'c') {
            if (this.app?.editor.leafList.list.length>0) {
                this.myApi.copy(this.app.editor.leafList.list[0].toString())
            }
        }


        // 监听Ctrl+S保存
    }
    get hasElements(): boolean {
        return this.app?.tree.children.length > 0;
    }



    fieldChange(event: any, field: string ) {
        if (this.app?.editor.leafList.list.length>0) {
            (this.app.editor.leafList.list[0] as any)[field] = event;
        }else{
            (this.app as any )[field] = event;
        }
    }
}

import {AfterViewInit, Component, ElementRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
import { App, Rect, Ellipse,KeyEvent, PointerEvent } from 'leafer-ui'
import { Ruler } from 'leafer-x-ruler'
import { Snap } from 'leafer-x-easy-snap'
import '@leafer-in/editor' // 导入图形编辑器插件
import '@leafer-in/viewport'
import {NzButtonComponent, NzButtonGroupComponent} from "ng-zorro-antd/button";
import {NzIconDirective} from "ng-zorro-antd/icon";
import {NzCollapseComponent, NzCollapsePanelComponent} from "ng-zorro-antd/collapse";
import {NzTabComponent, NzTabSetComponent} from "ng-zorro-antd/tabs";
import {NzFormControlComponent, NzFormItemComponent, NzFormLabelComponent} from "ng-zorro-antd/form";
import {NzInputNumberComponent} from "ng-zorro-antd/input-number";
import {FormsModule} from "@angular/forms";
import {NzTreeComponent} from "ng-zorro-antd/tree"; // 导入视口插件 (可选)
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
        NzFormItemComponent,
        NzFormLabelComponent,
        NzFormControlComponent,
        NzInputNumberComponent,
        FormsModule,
        NzTreeComponent
    ],
  templateUrl: './print.component.html',
  styleUrl: './print.component.less'
})
export class PrintComponent implements AfterViewInit{
    //@ViewChild('tools') tools!: ElementRef<HTMLElement> ;
    @ViewChild('leafer') leafer!: ElementRef<HTMLElement> ;
    hasElements = false;
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
    private app!: App;
    constructor() { }



    ngAfterViewInit(): void {

        // 创建应用
        this. app = new App({ view: 'leafer', fill: '#333', editor: {
                keyEvent:true
            } ,tree: { type: 'viewport' },wheel: { disabled: true }})
        const ruler = new Ruler(this. app)
        const snap = new Snap(this. app)
// 启用
        snap.enable(true)
        this.leafer.nativeElement.tabIndex = 0;
        this.app.on('keydown', (e: any) => {
            // 只有當 LeaferJS 內部識別到事件時才會觸發
            console.log('Leafer keydown:', e.key);
        });
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
                this.app.tree.add(Rect.one({ fill: '#32cd79', editable: true ,event: {
                        // [KeyEvent.DOWN]: [
                        //     function (e: KeyEvent) {
                        //         console.log(e.code)
                        //     },
                        //     //'once', // 同 on() 的第二个参数
                        // ],
                        [PointerEvent.ENTER]: function (e: PointerEvent) {
                            console.log('enter')
                        },
                        [KeyEvent.DOWN]: function (e: KeyEvent) {
                            console.log('down')
                           console.log(e.code)
                        }
                    },}, point.x, point.y))
            } else if (type === 'circle') {
                this.app.tree.add(Ellipse.one({ fill: '#32cd79', editable: true, event: {
                        // [KeyEvent.DOWN]: [
                        //     function (e: KeyEvent) {
                        //         console.log(e.code)
                        //     },
                        //     //'once', // 同 on() 的第二个参数
                        // ],
                        [KeyEvent.DOWN]: function (e: KeyEvent) {
                            console.log('down')
                            console.log(e.code)
                        }
                    },}, point.x, point.y))
            }
        })


    }
    selectedElement: any = {};
    initDragAndDrop(): void {
        // 实现拖拽功能

    }

    editTemplate(): void {
        // 编辑模板逻辑
    }

    saveTemplate(): void {
        // 保存模板逻辑
    }

    exportTemplate(): void {
        // 导出模板逻辑
    }

    previewTemplate(): void {
        // 预览模板逻辑
    }

}

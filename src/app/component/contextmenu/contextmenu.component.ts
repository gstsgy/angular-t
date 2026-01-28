import { Component,Input,Output,EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { NzContextMenuService, NzDropdownMenuComponent, NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
interface MenuItem {
  icon?: string;    // 图标类名/URL
  label: string;    // 名称
  shortcut?: string;// 快捷键
  value: any;       // 值
}

export type {MenuItem}
@Component({
  selector: 'app-contextmenu',
  standalone: true,
  imports: [NzDropDownModule,NzIconModule],
  templateUrl: './contextmenu.component.html',
  styleUrl: './contextmenu.component.less'
})
export class ContextmenuComponent  {
  @ViewChild(NzDropdownMenuComponent, { static: true }) 
  menu!: NzDropdownMenuComponent;  // 加上 static: true
  @Input('items')
  public items:Array<MenuItem> = []
  @Output()
  callback:EventEmitter<string>=new EventEmitter<string>();

  contextMenu($event: MouseEvent): void {
    this.nzContextMenuService.create($event, this.menu);
  }

  constructor(private nzContextMenuService: NzContextMenuService) {
  }

  click(item:string){
    this.callback.emit(item)
  }
}

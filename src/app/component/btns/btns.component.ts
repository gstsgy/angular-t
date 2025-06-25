import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzFlexDirective} from "ng-zorro-antd/flex";
import {NzIconDirective} from "ng-zorro-antd/icon";
import {BtnModel} from "@model/forms";

@Component({
  selector: 'app-btns',
  standalone: true,
    imports: [
        NzButtonComponent,
        NzFlexDirective,
        NzIconDirective

    ],
  templateUrl: './btns.component.html',
  styleUrl: './btns.component.less'
})
export class BtnsComponent {

    @Input('btns')
    bts:Array<BtnModel>=[]

    @Output()
    clc:EventEmitter<string>=new EventEmitter<string>();

    btnClick(code:string):void{
        this.clc.emit(code)
    }
}

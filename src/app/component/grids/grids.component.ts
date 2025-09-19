import {
    Component,
    EventEmitter,
    OnChanges,
    Input,
    Output,
    SimpleChanges,
    AfterViewInit,
    OnDestroy,
    ElementRef,
    NgZone,
    ChangeDetectorRef,
    HostListener,
    ViewChild,
    ContentChildren,
    QueryList,
    TemplateRef
} from '@angular/core';
import {
    NzTableModule, NzTableQueryParams, NzTableComponent
} from "ng-zorro-antd/table";
import {FormsModel} from "@model/forms";
import { FormsModule } from '@angular/forms';
import {CdkDragDrop, moveItemInArray, DragDropModule} from '@angular/cdk/drag-drop';
import {NzResizableModule, NzResizeEvent} from 'ng-zorro-antd/resizable';
import { CommonModule } from '@angular/common';
import { SmartTemplateDirective } from '@app/directive/SmartTemplateDirective';

import {NzInputModule} from 'ng-zorro-antd/input';
import {NzSwitchModule} from 'ng-zorro-antd/switch';
import {NzSelectComponent} from "ng-zorro-antd/select";
import {NzRadioComponent, NzRadioGroupComponent} from "ng-zorro-antd/radio";
import {NzDatePickerComponent} from "ng-zorro-antd/date-picker";
import {NzTimePickerComponent} from "ng-zorro-antd/time-picker";
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
@Component({
    selector: 'app-grids',
    standalone: true,
    imports: [
        NzTableModule,
        NzPaginationModule,
        DragDropModule,
        NzResizableModule,
        CommonModule,
        NzInputModule,
        NzSwitchModule,
        NzSelectComponent,
        NzRadioComponent,
        NzRadioGroupComponent,
        NzDatePickerComponent,
        NzTimePickerComponent,
        NzTreeSelectModule,
        FormsModule
    ],
    templateUrl: './grids.component.html',
    styleUrl: './grids.component.less',
})
export class GridsComponent implements OnChanges, AfterViewInit, OnDestroy {
    @ViewChild('basicTable', {static: false}) nzTableComponent?: NzTableComponent<any>;

    @Input('data')
    data: any[] = []

    @Input('isSelected')
    isSelected = false;

    @Input('editable')
    editable = false;

    @Input('search-query')
    searchQuery: any = {
        pageNum: 1,
        pageSize: 50,
        total: 0
    }
    pageSizeOptions = [50, 200, 500, 2000, 5000]

    @Input('form-grids')
    formGrid: Array<FormsModel> = []

    setOfCheckedId: Set<number> = new Set<number>();

    @Output()
    nzQueryParamsFun: EventEmitter<NzTableQueryParams> = new EventEmitter();

    @Output()
    colDblClick: EventEmitter<{ row: any, col: FormsModel }> = new EventEmitter();

    @Output()
    selectData: EventEmitter<any[]> = new EventEmitter();
    private mutationObserver!: MutationObserver;
    nzScrollConfig = {
        y: '100%',
        x: '100%'
    }

    @Input('templates') templates!: QueryList<SmartTemplateDirective>;

    constructor(private el: ElementRef, private ngZone: NgZone, private cd: ChangeDetectorRef) {
    }
    
    getTemplate(key: string): TemplateRef<any> | null {
        const item = this.templates.find(item=>item.id===key);
        if(item){
            return item.templateRef;
        }
        return null;
      }

    ngOnDestroy(): void {
        this.mutationObserver.disconnect();
    }

    ngAfterViewInit(): void {
        // 创建一个 MutationObserver 实例
        const observer = new MutationObserver(() => {
            this.updateHeight(); // 初始化逻辑
        });

        // 配置观察选项
        const config = {childList: true, subtree: true};

        // 开始观察目标节点
        const div2 = this.el.nativeElement;
        this.ngZone.runOutsideAngular(() => {
            // @ts-ignore
            return observer.observe(div2, config);
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data']) {
            this.setOfCheckedId.clear();
            this.cd.detectChanges();
            (this.nzTableComponent as any).cdkVirtualScrollViewport?.checkViewportSize();
            this.updateHeight();
        }
    }

    nzQueryParams(params: NzTableQueryParams) {
        this.nzQueryParamsFun.emit(params);
    }
    nzPageIndexChange(event: number){
        this.searchQuery.pageNum = event;
        this.nzQueryParamsFun.emit({pageIndex: this.searchQuery.pageNum, pageSize: this.searchQuery.pageSize, sort: [], filter: []});
    }
    nzPageSizeChange(event: number) {
        this.searchQuery.pageSize = event;
        this.nzQueryParamsFun.emit({pageIndex: this.searchQuery.pageNum, pageSize: this.searchQuery.pageSize, sort: [], filter: []});
    }

    edit(row: any, col: FormsModel) {
        this.colDblClick.emit({row, col});
    }

    formation(form: FormsModel, value: any) {
        if (form.type === 'select' || form.type === 'radio') {
            const item = form.options?.find(item => item.value === value);
            if (item) {
                return item.label;
            }
            return value;
        }
        return value;
    }

    get isSelectAll() {
        return this.setOfCheckedId.size === this.data.length && this.setOfCheckedId.size > 0;
    }

    get indeterminate() {
        return this.setOfCheckedId.size !== this.data.length && this.setOfCheckedId.size > 0;
    }

    onAllChecked(isSelected: boolean) {
        if (isSelected) {
            this.data.forEach((_item, index) => this.setOfCheckedId.add(index))
            this.selectData.emit(this.data);
        } else {
            this.setOfCheckedId.clear();
            this.selectData.emit([]);
        }
    }

    onItemChecked(index: number, isSelected: boolean) {
        if (isSelected) {
            this.setOfCheckedId.add(index);
        } else {
            this.setOfCheckedId.delete(index);
        }
        const arr: any[] = []
        this.setOfCheckedId.forEach(it => {
            arr.push(this.data[it]);
        })
        this.selectData.emit(arr);
    }

    drop(event: CdkDragDrop<string[]>): void {
        moveItemInArray(this.formGrid, event.previousIndex, event.currentIndex);
    }

    onSort(event: string | null, col: string) {
        console.log(event, col);
       // this.nzQueryParamsFun.emit({pageIndex: this.searchQuery.pageNum, pageSize: this.searchQuery.pageSize, sort: [{key: event.key, value: event.value}], filter: []});
    }

    private updateHeight() {
        // 39是表头高度  32 是分页器高度 10是margin-top
        const lasth = this.el.nativeElement.offsetHeight- 39-32-10;
        this.nzScrollConfig = {
                y: lasth + 'px',
                x: '100%'
        }
    }

    // @HostListener('window:resize')
    // onResize() {
    //     // 窗口自适应大小
    //     this.updateHeight();
    // }

    trackByIndex(index: number, data: any): number {
        const possibleKeys = ['id', 'key', 'uid', 'code'];
        for (const key of possibleKeys) {
            if (data[key] !== undefined) {
                return data[key];
            }
        }
        // 没有唯一字段时回退到 index（需在文档中说明风险）
        return index;
    }


    onResizeW({width}: NzResizeEvent, col: string): void {
        const ele = this.formGrid.find(it => it.code === col);
        if (ele) {
            ele.width = `${width}px`;
        }
    }
    getPlaceholder(name:string|null):string{
        return `请输入${name} `;
    }
}

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
    NzTableModule, NzTableQueryParams, NzTableComponent, NzCustomColumn
} from "ng-zorro-antd/table";
import {FormsModel} from "@model/forms";
import {CdkDragDrop, moveItemInArray, DragDropModule} from '@angular/cdk/drag-drop';
import {NzResizableModule, NzResizeEvent} from 'ng-zorro-antd/resizable';
import { CommonModule } from '@angular/common';
import { SmartTemplateDirective } from '@app/directive/SmartTemplateDirective';
@Component({
    selector: 'app-grids',
    standalone: true,
    imports: [
        NzTableModule,
        DragDropModule,
        NzResizableModule,
        CommonModule
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
        y: '240px',
        x: '100%'
    }

    @ContentChildren(SmartTemplateDirective) templates!: QueryList<SmartTemplateDirective>;

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
        const div2 = this.el.nativeElement.parentElement?.querySelector('app-forms') as HTMLElement;
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
        }
    }

    nzQueryParams(params: NzTableQueryParams) {
        this.nzQueryParamsFun.emit(params);
    }

    nzPageSizeChange(event: number) {
        this.searchQuery.pageSize = event;
        this.nzQueryParamsFun.emit({pageIndex: 1, pageSize: event, sort: [], filter: []});
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

    private updateHeight() {
        let parent = this.el.nativeElement.parentElement;
        if (!parent) return
        parent = parent.parentElement;
        if (!parent) return
        const totalHeight = parent?.offsetHeight;

        if (totalHeight) {
            // 获取兄弟 div1 和 div2 的高度（通过 DOM 查询）
            const div1 = parent?.querySelector('app-btns') as HTMLElement;
            const div2 = parent?.querySelector('app-forms') as HTMLElement;
            const l1 = div1?.offsetHeight | 0;
            const l2 = div2?.offsetHeight | 0;
            const h = totalHeight - l1 - l2 - 50 - 55 - 32;
            this.nzScrollConfig = {
                y: h + 'px',
                x: '100%'
            }

        }
    }

    @HostListener('window:resize')
    onResize() {
        // 窗口自适应大小
        this.updateHeight();
    }

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
        console.log(width, col)
        const ele = this.formGrid.find(it => it.code === col);
        if (ele) {
            ele.width = `${width}px`;
        }
    }
}

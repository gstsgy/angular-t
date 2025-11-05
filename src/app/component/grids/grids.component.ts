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
    ViewChild,
    QueryList,
    TemplateRef
} from '@angular/core';
import {
    NzTableModule, NzTableQueryParams, NzTableComponent
} from "ng-zorro-antd/table";
import {FormsModel} from "@model/forms";
import {FormsModule} from '@angular/forms';
import {CdkDragDrop, moveItemInArray, DragDropModule} from '@angular/cdk/drag-drop';
import {NzResizableModule, NzResizeEvent} from 'ng-zorro-antd/resizable';
import {CommonModule} from '@angular/common';
import {SmartTemplateDirective} from '@app/directive/SmartTemplateDirective';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzSwitchModule} from 'ng-zorro-antd/switch';
import {NzSelectComponent} from "ng-zorro-antd/select";
import {NzRadioComponent, NzRadioGroupComponent} from "ng-zorro-antd/radio";
import {NzDatePickerComponent} from "ng-zorro-antd/date-picker";
import {NzTimePickerComponent} from "ng-zorro-antd/time-picker";
import {NzTreeSelectModule} from 'ng-zorro-antd/tree-select';
import {NzPaginationModule} from 'ng-zorro-antd/pagination';
import {NavigationStart, Router, NavigationEnd} from '@angular/router';
import {debounceTime, distinctUntilChanged, filter} from 'rxjs/operators';

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

    nzFiltersData: Map<String, Array<{
        text: string;
        value: string;
    }>> = new Map();

    @Input('editable')
    editable = false;

    @Input('search-query')
    searchQuery: any = {
        pageNum: 1,
        pageSize: 50,
        orderBy: null,
        asc: true,
        total: 0
    }
    pageSizeOptions = [50, 200, 500, 2000, 5000];

    isVirtualScroll: boolean = false;
    @Input('form-grids')
    formGrid: Array<FormsModel> = []

    setOfCheckedId: Set<number> = new Set<number>();

    @Output()
    queryFun: EventEmitter<any> = new EventEmitter();

    @Output()
    colDblClick: EventEmitter<{ row: any, col: FormsModel }> = new EventEmitter();

    @Output()
    selectData: EventEmitter<any[]> = new EventEmitter();
    private mutationObserver!: MutationObserver;
    nzScrollConfig = {
        y: '100%',
        x: '80%'
    }

    @Input('templates') templates!: QueryList<SmartTemplateDirective>;

    // 用于跟踪组件是否处于活动状态
    private isActive = true;
    private routerSubscription: any;
    private leaveSubscription: any;
    private currentUrl: string = '';
    private scrollPosition = 0;

    constructor(
        private el: ElementRef,
        private ngZone: NgZone,
        private cd: ChangeDetectorRef,
        private router: Router
    ) {
    }


    getTemplate(key: string): TemplateRef<any> | null {
        const item = this.templates.find(item => item.id === key);
        if (item) {
            return item.templateRef;
        }
        return null;
    }

    ngOnDestroy(): void {
        this.mutationObserver?.disconnect();
        this.isActive = false;
        if (this.routerSubscription) {
            this.routerSubscription.unsubscribe();
        }
        if (this.leaveSubscription) {
            this.leaveSubscription.unsubscribe();
        }
    }

    ngAfterViewInit(): void {
        this.currentUrl = this.router.url;
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

        // 监听路由变化，在导航开始时刷新虚拟滚动状态（仅当数据量大时需要）
        // @ts-ignore
        this.routerSubscription = this.router.events.pipe(
            filter(event => event instanceof NavigationStart),
            // 去重：相同的URL在短时间内只处理一次
            distinctUntilChanged((prev, curr) =>
                (prev as NavigationStart).url === (curr as NavigationStart).url
            ),
            // 防抖：避免快速连续触发
            debounceTime(50)
        ).subscribe((event) => {
            //console.log('routerSubscription', event,this.currentUrl)
            // 只有在数据量大并启用了虚拟滚动时才需要刷新
            if (this.currentUrl === (event as NavigationStart).url && !this.isActive) {
                this.isActive = true;
                setTimeout(() => {
                    // 先滚动到顶部
                    this.refreshVirtualScroll();
                }, 0);
            }
        });
        // 监控路由离开
        this.leaveSubscription = this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            // 去重：相同的URL在短时间内只处理一次
            distinctUntilChanged((prev, curr) =>
                (prev as NavigationEnd).url === (curr as NavigationEnd).url
            ),
            // 防抖：避免快速连续触发
            debounceTime(50)
        ).subscribe((event) => {

            if (this.isActive && this.currentUrl !== (event as NavigationEnd).url) {
                this.isActive = false;
                this.scrollPosition = this.getScrollPosition();
                console.log('离开', this.scrollPosition);
            }

        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data']) {
            this.setOfCheckedId.clear();
            this.cd.detectChanges();
            this.updateHeight();
            this.updateFiltersData();
        } else if (changes['formGrid']) {
            this.updateFiltersFn();
        }
    }

    //解决虚拟滚动空白问题的关键方法（仅在数据量大时使用）
    private refreshVirtualScroll(): void {
        if (this.isActive) {
            if (this.isVirtualScroll) {

                this.nzTableComponent?.cdkVirtualScrollViewport?.scrollToOffset(this.scrollPosition);
                // 强制重新计算视口大小
                this.nzTableComponent?.cdkVirtualScrollViewport?.checkViewportSize();

            } else {
                const tableBody = this.el.nativeElement.querySelector('.ant-table-body');
                if (tableBody) {
                    tableBody.scrollTop = this.scrollPosition;
                }
            }


        }
    }

    private getScrollPosition(): number {
        if (this.nzTableComponent?.cdkVirtualScrollViewport) {
            // 虚拟滚动情况下的滚动位置
            return this.nzTableComponent.cdkVirtualScrollViewport.getOffsetToRenderedContentStart() ?? 0;
        } else {
            // 普通滚动情况下的滚动位置
            const tableBody = this.el.nativeElement.querySelector('.ant-table-body');
            console.log('滚动位置', tableBody,tableBody.scrollTop);
            return tableBody ? tableBody.scrollTop : 0;
        }
    }


    // nzQueryParams(params: NzTableQueryParams) {
    //     this.searchQuery.pageNum = params.pageIndex;
    //     this.searchQuery.pageSize = params.pageSize;
    //     this.queryFun.emit(this.searchQuery);
    // }

    nzPageIndexChange(event: number) {
        this.searchQuery.pageNum = event;
        this.queryFun.emit(this.searchQuery);
    }

    nzPageSizeChange(event: number) {
        this.searchQuery.pageSize = event;
        this.isVirtualScroll = this.searchQuery.pageSize > 1000;
        //this.queryFun.emit(this.searchQuery);
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
        this.searchQuery.asc = event === 'ascend';
        this.searchQuery.orderBy = col;
        if (event === null) {
            this.searchQuery.orderBy = null;
        }
        this.queryFun.emit(this.searchQuery);
    }

    private updateFiltersFn() {
        this.formGrid.filter(it => it.isFilter).forEach(it => {
            it.filterFn = (list: string[], item: any) => list.some(name => item[it.code].indexOf(name) !== -1)
        })
    }

    private updateFiltersData() {
        this.formGrid.filter(it => it.isFilter).forEach(it => {
            const arr: { text: string; value: string }[] = [];
            this.data.forEach(item => {
                if (!arr.find(i => i.value === item[it.code])) {
                    arr.push({text: item[it.code], value: item[it.code]})
                }
            })
            this.nzFiltersData.set(it.code, arr);
        })
    }

    private updateHeight() {
        // 39是表头高度  32 是分页器高度 10是margin-top
        const lasth = this.el.nativeElement.offsetHeight - 39 - 32 - 10;
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

    getPlaceholder(name: string | null): string {
        return `请输入${name} `;
    }
}
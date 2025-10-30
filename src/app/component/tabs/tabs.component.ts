import {Component, EventEmitter, Output, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import {NgClass} from "@angular/common";
import {NzIconDirective} from "ng-zorro-antd/icon";
import {TabModel} from "@model/forms";
import {MyApiService} from "@service/my-api.service";
import {Subscription} from "rxjs";
import {NzContextMenuService, NzDropDownDirective, NzDropdownMenuComponent} from "ng-zorro-antd/dropdown";
import {NzMenuDirective, NzMenuItemComponent} from "ng-zorro-antd/menu";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'app-tabs',
    standalone: true,
    imports: [
        NgClass,
        NzIconDirective,
        NzDropDownDirective,
        NzDropdownMenuComponent,
        NzMenuDirective,
        NzMenuItemComponent
    ],
    templateUrl: './tabs.component.html',
    styleUrl: './tabs.component.less'
})
export class TabsComponent implements AfterViewInit {
    @ViewChild('tabsContainer') tabsContainer!: ElementRef;

    constructor(public myApi: MyApiService, private nzContextMenuService: NzContextMenuService,  private route: ActivatedRoute, private router: Router) {
    }

    public subscription: Subscription | undefined;

    ngAfterViewInit(): void {
        this.subscription = this.myApi.getRouterJumpMessage().subscribe(
            path => {
                this.myApi.tabs.forEach(it => it.active = false);
                // 根据 msg 来处理你的业务逻辑
                const findItem = this.myApi.tabs.find(it => it.code === path);
                if (findItem) {
                    findItem.active = true;
                } else {
                    let item = this.myApi.getMenuByPath(path);
                    if (item) {
                        this.myApi.tabs.push({
                            menuCode:item.id,
                            code: item.path,
                            name: item.name,
                            active: true
                        });
                    }
                }
            })
    }

    @Output()
    moveMenu = new EventEmitter();

    close(index: number, item: TabModel,event: MouseEvent): void {
        event.stopPropagation(); // 阻止事件冒泡
        if (item.code === 'home') {
            this.myApi.warning("首页不能关闭");
            return;
        }
        this.myApi.tabs.splice(index, 1);
        if (item.active) {
            const newIndex = Math.max(index - 1, 0);
            this.myApi.tabs[newIndex].active = true;
            this.moveMenu.emit(this.myApi.tabs[newIndex]);
        }
    }

    add(item: TabModel) {
        this.myApi.tabs.forEach(it => it.active = false);

        const findItem = this.myApi.tabs.find(it => it.code === item.code);
        if (findItem) {
            findItem.active = true;
            return
        }
        item.active = true;
        this.myApi.tabs.push(item);
    }

    active(item: TabModel) {
        this.myApi.tabs.forEach(it => it.active = false);
        item.active = true;
        this.moveMenu.emit(item);
    }

    left() {
    }

    contextMenu(active: boolean | null | undefined, $event: MouseEvent, menu: NzDropdownMenuComponent): void {
        $event.preventDefault();
        this.nzContextMenuService.create($event, menu);
    }

    closeAll() {
        const homeTab = this.myApi.tabs.find(tab => tab.code === 'home');
        this.myApi.tabs = homeTab ? [homeTab] : [];
        if (homeTab) {
            homeTab.active = true;
            this.moveMenu.emit(homeTab);
        }
    }

    closeLeft() {
        const activeIndex = this.myApi.tabs.findIndex(tab => tab.active);
        if (activeIndex <= 1) {
            return;
        }
        this.myApi.tabs = this.myApi.tabs.filter((tab, index) => index >= activeIndex || tab.code === 'home');
        if (!this.myApi.tabs.some(tab => tab.active)) {
            this.myApi.tabs[0].active = true;
            this.moveMenu.emit(this.myApi.tabs[0]);
        }

    }

    closeRight() {
        const activeIndex = this.myApi.tabs.findIndex(tab => tab.active);
        if (activeIndex < 0) {
            return;
        }
        this.myApi.tabs = this.myApi.tabs.filter((tab, index) => index <= activeIndex || tab.code === 'home');
        if (!this.myApi.tabs.some(tab => tab.active)) {
            this.myApi.tabs[0].active = true;
            this.moveMenu.emit(this.myApi.tabs[0]);
        }
    }

    reloadCurrentPage(index: number, item: TabModel) {
        this.myApi.shouldReuse = false;
        // 1. 移除当前标签页
        this.myApi.tabs.splice(index, 1);

        this.myApi.navigateReload(item.code);

        setTimeout(() => {
            this.myApi.shouldReuse = true;
            this.myApi.tabs.splice(index, 0, item); // 重新添加标签页
        }, 200)
    }

    // 标签滚动功能
    scrollTabs(scrollAmount: number) {
        const tabsContainer = this.tabsContainer.nativeElement;
        tabsContainer.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }
}
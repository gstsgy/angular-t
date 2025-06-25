import {RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle} from '@angular/router';
import {MyApiService} from "@service/my-api.service";
import {Injector} from "@angular/core";


export class RouteStrategyService implements RouteReuseStrategy {
    private myapi: MyApiService | null = null;

    constructor(private injector: Injector) {
    }

    private getMyApiService(): MyApiService {
        if (!this.myapi) {
            this.myapi = this.injector.get(MyApiService);
        }
        return this.myapi;
    }

    // one 进入路由触发，是否同一路由时复用路由
    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {

        const futureurl = this.getFullRouteURL(future);

        const currurl = this.getFullRouteURL(curr);
        // 如果启用了强制刷新，返回 false
        const myapi = this.getMyApiService();
        return futureurl === currurl &&myapi.shouldReuse;
    }

    // 获取存储路由
    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
        const url = this.getFullRouteURL(route);
        const myapi = this.getMyApiService();
        const item = myapi.tabs.find(it => it.code === url);
        if (item && item.handle) {
            // @ts-ignore
            return item.handle;
        }
        return null;

    }

    // 是否允许复用路由
    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return Boolean(route.data?.["keep"]);
    }

    // 当路由离开时会触发，存储路由
    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        const url = this.getFullRouteURL(route);
        const myapi = this.getMyApiService();
        const item = myapi.tabs.find(it => it.code === url);
        if (item !== undefined) {
            item.handle = handle;
        }
    }

    //  是否允许还原路由
    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        const url = this.getFullRouteURL(route);
        const myapi = this.getMyApiService();
        const item = myapi.tabs.find(it => it.code === url);
        return Boolean(route.data?.["keep"]) && item !== undefined && item.handle !== undefined;
    }

    // 获取当前路由url
    private getFullRouteURL(route: ActivatedRouteSnapshot): string {
        const {pathFromRoot} = route;
        let fullRouteUrlPath: string[] = [];
        pathFromRoot.forEach((item: ActivatedRouteSnapshot) => {
            fullRouteUrlPath = fullRouteUrlPath.concat(this.getRouteUrlPath(item));
        });
        return `/${fullRouteUrlPath.join('/')}`;

    }

    private getRouteUrlPath(route: ActivatedRouteSnapshot) {
        return route.url.map(urlSegment => urlSegment.path);
    }

}

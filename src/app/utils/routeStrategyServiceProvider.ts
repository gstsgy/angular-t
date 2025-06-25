import {FactoryProvider, Injector} from "@angular/core";
import {RouteReuseStrategy} from "@angular/router";
import {RouteStrategyService} from "@service/route-strategy.service";

export const routeStrategyServiceProvider: FactoryProvider = {
    provide: RouteReuseStrategy,
    useFactory: ( injector: Injector) => {
        return new RouteStrategyService(injector);
    },
    deps: [Injector] // 依赖项列表
};
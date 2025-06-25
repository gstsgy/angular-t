import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { icons } from './icons-provider';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { zh_CN, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {LoginGuard,DeFaultGuard} from '@utils/LoginGuard';
import noopInterceptor from "@utils/AuthInterceptor";
import { NzModalService } from 'ng-zorro-antd/modal';
import {routeStrategyServiceProvider} from "@utils/routeStrategyServiceProvider";
registerLocaleData(zh);

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),LoginGuard,DeFaultGuard, provideClientHydration(),
    provideNzIcons(icons), provideNzI18n(zh_CN),
    importProvidersFrom(FormsModule), provideAnimationsAsync(),
    provideHttpClient(withFetch(),withInterceptors([noopInterceptor]),),
    routeStrategyServiceProvider,
    NzModalService]
};

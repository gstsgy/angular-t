import {inject} from '@angular/core';
import {
    HttpInterceptorFn, HttpHandlerFn, HttpRequest, HttpResponse
} from '@angular/common/http';
import {tap, catchError} from 'rxjs/operators';
import {NzMessageService} from "ng-zorro-antd/message";
import {ResponseBean} from "@model/forms";

const noopInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const message = inject(NzMessageService);
    return next(req).pipe(
        tap({
            next: event => {
                if (event instanceof HttpResponse) {
                    const responseBody = event.body as ResponseBean;
                    if (responseBody.code !== 200) {
                        message.create('error', responseBody.message ?? "")
                    }
                }
            },
            error: error => {
                switch (error.status) {
                    case 400:
                        break;
                    case 401:
                    case 402:
                    case 403:
                    case 404:
                    case 500:
                        message.create('error', error.statusText);
                        break;
                    default:
                        message.create('error', '网络异常');
                }
            },
            finalize: () => {
            }
        })
    );

};

export default noopInterceptor;
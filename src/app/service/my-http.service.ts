import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ResponseBean} from "@model/forms";
import {firstValueFrom, lastValueFrom} from 'rxjs';
import {UserService} from './user.service';

@Injectable({
    providedIn: 'root'
})
export class MyHttpService {
    constructor(private myHttp: HttpClient, private userService: UserService) {

    }
     private baseUrl = 'https://gstsgy.com/api/';
     //private baseUrl = 'https://glqusq-gyghau-8080.app.cloudstudio.work/';
    //private baseUrl = 'http://localhost:8080/';

    get(url: string, data?: any, headers?: any, config?: any): Promise<ResponseBean> {
        return this.request('get', url, data, headers,config);
    }

    post(url: string, data?: any, headers?: any, config?: any): Promise<ResponseBean> {
        return this.request('post', url, data, headers,config);
    }

    delete(url: string, data?: any, headers?: any, config?: any): Promise<ResponseBean> {
        return this.request('delete', url, data, headers,config);
    }

    put(url: string, data?: any, headers?: any, config?: any): Promise<ResponseBean> {
        return this.request('put', url, data, headers,config);
    }

    request(method: string, url: string, data?: any, headers?: any, config?: any): Promise<ResponseBean> {
        if (!url.startsWith('http')) {
            if (url.startsWith('/')) {
                url = url.substring(1);
            }
            url = this.baseUrl + url;
        }
        if(method === 'get') {
            const params:any = {}
            for(const key in data) {
                if(data[key] !== undefined&&data[key] !== null&&data[key] !== ''&&data[key] !== 'null') {
                    params[key] = data[key];
                }
            }
            // @ts-ignore
            return firstValueFrom(this.myHttp.request(method, url, {
                params: params,
                headers: {token: this.userService.token ?? '', ...headers},
                ...config
            }));
        }
        // @ts-ignore
        return firstValueFrom(this.myHttp.request(method, url, {
            body: data,
            headers: {token: this.userService.token ?? '', ...headers},
            ...config
        }));
    }

    request2(method: string, url: string, data?: any, headers?: any, config?: any) {
        if (!url.startsWith('http')) {
            if (url.startsWith('/')) {
                url = url.substring(1);
            }
            url = this.baseUrl + url;
        }
        if(method === 'get') {
            const params:any = {}
            for(const key in data) {
                if(data[key] !== undefined&&data[key] !== null&&data[key] !== ''&&data[key] !== 'null') {
                    params[key] = data[key];
                }
            }
            // @ts-ignore
            return this.myHttp.request(method, url, {
                params: params,
                headers: {token: this.userService.token ?? '', ...headers},
                ...config
            });
        }
        // @ts-ignore
        return this.myHttp.request(method, url, {
            body: data,
            headers: {token: this.userService.token ?? '', ...headers},
            ...config
        });
    }
}

import { Injectable } from "@angular/core";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { ResponseBean } from "@model/forms";
import { firstValueFrom, lastValueFrom } from "rxjs";
import { UserService } from "./user.service";

@Injectable({
  providedIn: "root",
})
export class MyHttpService {
  constructor(private myHttp: HttpClient, private userService: UserService) {}
   private baseUrl = 'https://gstsgy.com/api/';
 // private baseUrl = "https://be3d8af7618b49a08380e8692a609f65--8080.ap-shanghai2.cloudstudio.club/";
  //private baseUrl = 'http://localhost:8080/';

  get(
    url: string,
    data?: any,
    headers?: any,
    config?: any
  ): Promise<ResponseBean> {
    return this.request("get", url, data, headers, config);
  }

  post(
    url: string,
    data?: any,
    headers?: any,
    config?: any
  ): Promise<ResponseBean> {
    return this.request("post", url, data, headers, config);
  }

  delete(
    url: string,
    data?: any,
    headers?: any,
    config?: any
  ): Promise<ResponseBean> {
    return this.request("delete", url, data, headers, config);
  }

  put(
    url: string,
    data?: any,
    headers?: any,
    config?: any
  ): Promise<ResponseBean> {
    return this.request("put", url, data, headers, config);
  }

  down(url: string) {
    if (!url.startsWith("http")) {
      if (url.startsWith("/")) {
        url = url.substring(1);
      }
      url = this.baseUrl + url;
    }
    this.myHttp
      .get(url, {
        responseType: "blob",
        observe: "response", // 获取完整响应
        headers: { token: this.userService.token ?? "" },
      })
      .subscribe((response: HttpResponse<Blob>) => {
        
        const contentDisposition = response.headers.get("content-disposition");
        const blob = response.body as Blob;
        // 创建下载链接
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
       

        // 设置文件名
        a.download = "1.png";
        
        // 触发下载
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // 释放URL对象
        window.URL.revokeObjectURL(url);
      });
  }
  private getFileNameFromHeaders(contentDisposition: string): string {
    // 从Content-Disposition头提取文件名
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(contentDisposition);
    if (matches != null && matches[1]) {
      return matches[1].replace(/['"]/g, "");
    }
    return "download.file";
  }
  request(
    method: string,
    url: string,
    data?: any,
    headers?: any,
    config?: any
  ): Promise<ResponseBean> {
    if (!url.startsWith("http")) {
      if (url.startsWith("/")) {
        url = url.substring(1);
      }
      url = this.baseUrl + url;
    }
    if (method === "get") {
      const params: any = {};
      for (const key in data) {
        if (
          data[key] !== undefined &&
          data[key] !== null &&
          data[key] !== "" &&
          data[key] !== "null"
        ) {
          params[key] = data[key];
        }
      }
      // @ts-ignore
      return firstValueFrom(
        this.myHttp.request(method, url, {
          params: params,
          headers: { token: this.userService.token ?? "", ...headers },
          ...config,
        })
      );
    }
    // @ts-ignore
    return firstValueFrom(
      this.myHttp.request(method, url, {
        body: data,
        headers: { token: this.userService.token ?? "", ...headers },
        ...config,
      })
    );
  }

  request2(
    method: string,
    url: string,
    data?: any,
    headers?: any,
    config?: any
  ) {
    if (!url.startsWith("http")) {
      if (url.startsWith("/")) {
        url = url.substring(1);
      }
      url = this.baseUrl + url;
    }
    if (method === "get") {
      const params: any = {};
      for (const key in data) {
        if (
          data[key] !== undefined &&
          data[key] !== null &&
          data[key] !== "" &&
          data[key] !== "null"
        ) {
          params[key] = data[key];
        }
      }
      // @ts-ignore
      return this.myHttp.request(method, url, {
        params: params,
        headers: { token: this.userService.token ?? "", ...headers },
        ...config,
      });
    }
    // @ts-ignore
    return this.myHttp.request(method, url, {
      body: data,
      headers: { token: this.userService.token ?? "", ...headers },
      ...config,
    });
  }
}

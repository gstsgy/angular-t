import {Injectable} from '@angular/core';
import {MyHttpService} from "@service/my-http.service";
import {NzMessageService} from "ng-zorro-antd/message";
import {NonNullableFormBuilder} from "@angular/forms";
import {Router} from "@angular/router";
import {Observable, Subject} from "rxjs";
import {ResponseBean, TabModel} from "@model/forms";
import {format, parse} from "date-fns";
import {NzModalService} from "ng-zorro-antd/modal";
import {PromptComponent} from '@app/component/prompt/prompt.component'; // 引入自定义内容组件
import * as XLSX from 'xlsx'
import {UserService} from './user.service';

@Injectable({
  providedIn: "root",
})
export class MyApiService {
  public menus: Array<any> = [];
  public tabs: Array<TabModel> = [
    {
      menuCode: "0",
      code: "home",
      name: "首页",
      active: true,
    },
  ];
  public shouldReuse: boolean = true; // 默认启用路由复用
  private dicts: Map<string, Array<{ value: string | number; label: string }>> =
    new Map();

  private dictSubjects = new Map();

  private routerJump = new Subject<string>();

  constructor(
    private readonly http: MyHttpService,
    private readonly message: NzMessageService,
    public fb: NonNullableFormBuilder,
    private readonly router: Router,
    public readonly modal: NzModalService,
    public readonly userService: UserService
  ) {}

  navigateById(url: string, id: string): void {
    const menu = this.getMenuByPath(url);
    if (menu) {
      this.router.navigate([url], {
        queryParams: { id: id, menuCode: menu.id, menuName: menu.name },
      });
    } else {
      this.router.navigate([url], { queryParams: { id: id } });
    }

    this.routerJump.next(url);
  }

  navigate(url: string): void {
    const menu = this.getMenuByPath(url);
    if (menu) {
      this.router.navigate([url], {
        queryParams: { menuCode: menu.id, menuName: menu.name },
      });
    } else {
      this.router.navigate([url]);
    }
    this.routerJump.next(url);
  }
  navigateReload(url: string): void {
    const menu = this.getMenuByPath(url);
    if (menu) {
      this.router.navigate([url], {
        onSameUrlNavigation: "reload",
        queryParams: { menuCode: menu.id, menuName: menu.name },
      });
    } else {
      this.router.navigate([url], { onSameUrlNavigation: "reload" });
    }
  }

  getRouterJumpMessage(): Observable<string> {
    return this.routerJump.asObservable();
  }

  getDict(
    code: string
  ): Observable<Array<{ value: string | number; label: string }>> {
    let subject: Subject<Array<{ value: string | number; label: string }>> =
      this.dictSubjects.get(code);
    if (subject === undefined) {
      subject = new Subject<Array<{ value: string | number; label: string }>>();
      this.dictSubjects.set(code, subject);
    }
    const item = this.dicts.get(code);
    if (item !== undefined) {
      subject.next(item);
    }
    this.http.get(`/dictionary/dictsenum`, { modelCode: code }).then((res) => {
      this.dicts.set(code, res.data);
      subject.next(res.data);
    });
    return subject.asObservable();
  }

  resetDict(code: string) {
    let subject: Subject<Array<{ value: string | number; label: string }>> =
      this.dictSubjects.get(code);
    if (subject !== undefined) {
      this.http
        .get(`/dictionary/dictsenum`, { modelCode: code })
        .then((res) => {
          this.dicts.set(code, res.data);
          subject.next(res.data);
        });
    }
  }

  public dateFormat = (date: Date) => {
    if (!date) {
      return "";
    }
    return format(date, "yyyy-MM-dd");
  };

  public datetimeFormat = (date: Date) => {
    if (!date) {
      return "";
    }
    return format(date, "yyyy-MM-dd HH:mm:ss");
  };

  public timeFormat = (date: Date) => {
    if (!date) {
      return "";
    }
    return format(date, "HH:mm:ss");
  };

  public dateParse = (date: string) => {
    if (!date) {
      return null;
    }
    const dater = parse(date, "yyyy-MM-dd", new Date());
    if (isNaN(dater.getTime())) {
      return null;
    }
    return dater;
  };

  public datetimeParse = (date: string) => {
    if (!date) {
      return null;
    }
    const dater = parse(date, "yyyy-MM-dd HH:mm:ss", new Date());
    if (isNaN(dater.getTime())) {
      return null;
    }
    return dater;
  };

  public timeParse = (date: string) => {
    if (!date) {
      return null;
    }
    const dater = parse(date, "HH:mm:ss", new Date());
    if (isNaN(dater.getTime())) {
      return null;
    }
    return dater;
  };

  public cleanTabs() {
    this.menus = [];
    this.tabs = [
      {
        menuCode: "0",
        code: "home",
        name: "首页",
        active: true,
      },
    ];
  }

  confirm(title: string, onFun: () => void) {
    this.modal.confirm({
      nzTitle: title,
      nzContent: "",
      nzOkText: "是",
      nzOkType: "primary",
      nzOkDanger: true,
      nzOnOk: () => onFun(),
      nzCancelText: "否",
      nzOnCancel: () => {},
    });
  }

  success(info: string) {
    this.message.success(info);
  }

  warning(info: string) {
    this.message.warning(info);
  }

  error(info: string) {
    this.message.error(info);
  }

  info(info: string) {
    this.message.info(info);
  }

  get(
    url: string,
    data?: any,
    headers?: any,
    config?: any
  ): Promise<ResponseBean> {
    return this.http.get(url, data, headers, config);
  }

  down(url: string) {
    this.http.down(url);
  }

  post(
    url: string,
    data?: any,
    headers?: any,
    config?: any
  ): Promise<ResponseBean> {
    return this.http.post(url, data, headers, config);
  }

  delete(
    url: string,
    data?: any,
    headers?: any,
    config?: any
  ): Promise<ResponseBean> {
    return this.http.delete(url, data, headers, config);
  }

  put(
    url: string,
    data?: any,
    headers?: any,
    config?: any
  ): Promise<ResponseBean> {
    return this.http.put(url, data, headers, config);
  }

  request(
    method: string,
    url: string,
    data?: any,
    headers?: any,
    config?: any
  ): Promise<ResponseBean> {
    return this.http.request(method, url, data, headers, config);
  }

  showPrompt(
    title: string,
    placeholder: string = "请输入内容"
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const modalRef = this.modal.create({
        nzTitle: title,
        nzContent: PromptComponent,
        nzData: placeholder, // 将 placeholder 传递给自定义组件

        nzOnOk: () => {
          const componentInstance = modalRef.getContentComponent();
          if (componentInstance && componentInstance.inputValue) {
            resolve(componentInstance.inputValue);
          } else {
            reject("用户未输入内容");
          }
        },
        nzOnCancel: () => {
          // 点击取消时，返回空值或拒绝
          reject("用户取消输入");
        },
      });
    });
  }

  getMenuByPath(path: string): any {
    return this.getMenuByPath1(path, this.menus);
  }

  getMenuByPath1(path: string, menus: Array<any>): any {
    // 先检查当前层级
    const found = menus.find((it) => it.path === path);
    if (found) return found;

    // 递归检查子菜单
    for (const menu of menus) {
      if (menu.children) {
        const foundInChildren = this.getMenuByPath1(path, menu.children);
        if (foundInChildren) {
          return foundInChildren; // ✅ 正确返回递归结果
        }
      }
    }

    return undefined; // 未找到时明确返回 undefined
  }

  exportToExcel(data: any, fileName: string) {
    let sheetData = XLSX.utils.json_to_sheet(data);
    let workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, sheetData, "Sheet1");
    XLSX.writeFile(workBook, `${fileName}.xlsx`);
  }

  copy(text: string){
      if (navigator.clipboard && window.isSecureContext) {
          // 使用现代 Clipboard API（需要 HTTPS 或 localhost）
          navigator.clipboard.writeText(text)
              .then(() => {
                 // this.success('复制成功:'+ text);
                  return true;
              })
              .catch(err => {
                  console.error('复制失败:', err);
                  this.error('复制失败:'+ text);
                  return false;
              });
      } else {
          // 降级到传统方法
          this.error('复制失败:'+ text);
      }
  }

    async readClipboard() {
        try {
            // 检查权限（需要 HTTPS 环境）
            const permission = await navigator.permissions.query({
                name: 'clipboard-read' as PermissionName
            });

            if (permission.state === 'denied') {
                alert('请允许剪贴板访问权限');
                return;
            }

            // 读取文本
            return await navigator.clipboard.readText();

            // // 读取多种格式
            // const clipboardItems = await navigator.clipboard.read();
            // for (const item of clipboardItems) {
            //     console.log('可用格式:', item.types);
            //
            //     // 获取文本
            //     if (item.types.includes('text/plain')) {
            //         const textBlob = await item.getType('text/plain');
            //         const text = await textBlob.text();
            //         console.log('纯文本:', text);
            //     }
            //
            //     // 获取 HTML
            //     if (item.types.includes('text/html')) {
            //         const htmlBlob = await item.getType('text/html');
            //         const html = await htmlBlob.text();
            //         console.log('HTML:', html);
            //     }
            //
            //     // 获取图片
            //     if (item.types.includes('image/png')) {
            //         const imageBlob = await item.getType('image/png');
            //         // 处理图片数据
            //     }
            // }
        } catch (err: any) {
            console.error('读取剪贴板失败:', err);
            return  '';
        }
    }
}

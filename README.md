表单配置中常量
所有_开头的code，表示只在前端显示或者前端使用，不会传到后台


1.表单code常量值
* _Index  配置在表格中，表示顺序号，从1开始，自动计算分页中的顺序号

2.表单类型有 'input'|'number'|'password'|'switch'|'select'|'radio'|'date'|'time'|'datetime'|'treeSelect'|'diy'
diy表示自定义组件，自定义组件根据code来匹配插槽
自定义组件定义 表格
如下
某diy组件code为_diy1
则父组件定义时为
 <ng-template appSmartTemplate="_diy1" let-row>
    <button nz-button nzType="primary">Primary Button</button>
  </ng-template>
 ts文件需引入
 import { SmartTemplateDirective } from '@app/directive/SmartTemplateDirective';
  imports: [
         ...
        SmartTemplateDirective
    ],


表单配置也是如此

3.表单默认值常量
* _UserId  表示当前登录的用户ID
* _UserName  表示当前登录的用户名
* _DateTimeNow  表示当前时间
* _DateNow  表示当前日期  
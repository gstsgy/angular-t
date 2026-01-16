import {
  Directive,
  ElementRef,
  inject,
  Input,
  Renderer2,
  OnInit,
  HostListener,
} from "@angular/core";
import { MyApiService } from "@service/my-api.service"; //
@Directive({
  selector: "[appTableCopyDirective]",
  standalone: true,
  host: {
    "(mousedown)": "mousedown($event)",
  },
})
export class TableCopyDirectiveDirective implements OnInit {
  private el = inject(ElementRef);
  @Input("appTableCopyDirective") isOpenCopy: boolean = false;

  selectCopyData = {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  };

  ismousedown: boolean = false;

  private readonly TD_SELECTOR = "td.ant-table-cell";

  get isOpen(): boolean {
    return this.el.nativeElement.tagName === "NZ-TABLE" && this.isOpenCopy;
  }

  constructor(private renderer: Renderer2, public myApi: MyApiService) {}

  ngOnInit() {
    this.addStyle();
    document.addEventListener("contextmenu", function (event) {
      event.preventDefault();
    });
  }

  addStyle() {
    const styleId = "table-copy-directive-styles";
    if(this.renderer.selectRootElement(styleId))return;
   // if (document.getElementById(styleId)) return;

    //const style = document.createElement("style");
    const style =this.renderer.createElement("style")
    style.id = styleId;
    style.textContent = `
      .select-copy {
        background-color: #d7d8fe !important;
      }
    `;
   // document.head.appendChild(style);
   
    this.renderer.appendChild(document.head,style);
  }

  private getAllTdElements(): HTMLElement[] {
    return Array.from(
      this.el.nativeElement.querySelectorAll(this.TD_SELECTOR)
    ) as HTMLElement[];
  }

  private getRowLength(): number {
    const firstRow = this.el.nativeElement.querySelector(".ant-table-fixed");
    if (!firstRow) return 0;
    return firstRow.querySelectorAll("col").length;
  }

  private getTableDimensions(): { rows: number; cols: number } {
    const rows = this.el.nativeElement.querySelectorAll("tr").length;
    const cols = this.getRowLength();
    return { rows, cols };
  }

  addClass() {
    // 清除之前的选择
    this.clearPreviousSelection();

    const dimensions = this.getTableDimensions();
    const cols = dimensions.cols;
    const allTds = this.getAllTdElements();

    // 规范化选择范围
    const startRow = Math.min(
      this.selectCopyData.startX,
      this.selectCopyData.endX
    );
    const endRow = Math.max(
      this.selectCopyData.startX,
      this.selectCopyData.endX
    );
    const startCol = Math.min(
      this.selectCopyData.startY,
      this.selectCopyData.endY
    );
    const endCol = Math.max(
      this.selectCopyData.startY,
      this.selectCopyData.endY
    );

    // 添加新选择
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const index = row * cols + col;
        if (index >= 0 && index < allTds.length) {
          const element = allTds[index];
          this.renderer.addClass(element, "select-copy");
          // 添加 visual feedback
        }
      }
    }
  }

  private clearPreviousSelection() {
    const allTds = this.getAllTdElements();
    allTds.forEach((td) => {
      this.renderer.removeClass(td, "select-copy");
    });
  }

  private addGlobalMouseMoveListener() {
    const mouseMoveHandler = (e: MouseEvent) => {
      if (!this.ismousedown) return;

      e.preventDefault();
      e.stopPropagation();

      const tdElement: HTMLElement = e.target as HTMLElement;
      if (tdElement.tagName === "TD") {
        const x = this.getDataRowIndex(tdElement);
        const y = (tdElement as HTMLTableCellElement).cellIndex;

        if (x !== -1 && y !== -1) {
          this.selectCopyData.endX = x;
          this.selectCopyData.endY = y;
          this.addClass();
        }
      }
    };
    //this.renderer.
    this.el.nativeElement.addEventListener("mousemove", mouseMoveHandler);

    // 返回清理函数
    return () => {
      this.el.nativeElement.removeEventListener("mousemove", mouseMoveHandler);
    };
  }

  private addGlobalMouseUpListener() {
    const mouseUpHandler = () => {
      this.ismousedown = false;
    };

    this.el.nativeElement.addEventListener("mouseup", mouseUpHandler);

    // 返回清理函数
    return () => {
      this.el.nativeElement.removeEventListener("mouseup", mouseUpHandler);
    };
  }

  @HostListener("document:keydown", ["$event"])
  handleGlobalKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key.toLowerCase() === "c") {
      const selectedData = this.getSelectedData();
      const text = selectedData.map((row) => row.join("\t")).join("\n");
      this.myApi.copy(text);
    }

    // 监听Ctrl+S保存
  }

  private getSelectedData(): any[][] {
    const dimensions = this.getTableDimensions();
    const cols = dimensions.cols;
    const allTds = this.getAllTdElements();
    const result: any[][] = [];

    const startRow = Math.min(
      this.selectCopyData.startX,
      this.selectCopyData.endX
    );
    const endRow = Math.max(
      this.selectCopyData.startX,
      this.selectCopyData.endX
    );
    const startCol = Math.min(
      this.selectCopyData.startY,
      this.selectCopyData.endY
    );
    const endCol = Math.max(
      this.selectCopyData.startY,
      this.selectCopyData.endY
    );

    for (let row = startRow; row <= endRow; row++) {
      const rowData: any[] = [];
      for (let col = startCol; col <= endCol; col++) {
        const index = row * cols + col;
        if (index >= 0 && index < allTds.length) {
          rowData.push(allTds[index].textContent?.trim() || "");
        }
      }
      if (rowData.length > 0) {
        result.push(rowData);
      }
    }

    return result;
  }
  mousedown(e: MouseEvent) {
    if (!this.isOpen) return;
    if (e.button === 2) {
      // 右键
      const tdElement: HTMLElement = e.target as HTMLElement;
      if (tdElement.tagName === "TD") {
        const x = this.getDataRowIndex(tdElement);
        const y = (tdElement as HTMLTableCellElement).cellIndex;
        const startRow = Math.min(
          this.selectCopyData.startX,
          this.selectCopyData.endX
        );
        const endRow = Math.max(
          this.selectCopyData.startX,
          this.selectCopyData.endX
        );
        const startCol = Math.min(
          this.selectCopyData.startY,
          this.selectCopyData.endY
        );
        const endCol = Math.max(
          this.selectCopyData.startY,
          this.selectCopyData.endY
        );
        if (x >= startRow && x <= endRow && y >= startCol && y <= endCol) {
          e.preventDefault();
          e.stopPropagation();
          // 阻止右键
          // this.myApi.confirm("是否复制内容", () => {
          //   const selectedData = this.getSelectedData();
          //   const text = selectedData.map((row) => row.join("\t")).join("\n");
          //   this.myApi.copy(text);
          // });
        }
      }
      return;
    }

    if (e.button !== 0) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    const tdElement: HTMLElement = e.target as HTMLElement;
    if (tdElement.tagName === "TD") {
      const x = this.getDataRowIndex(tdElement);
      const y = (tdElement as HTMLTableCellElement).cellIndex;

      if (x !== -1 && y !== -1) {
        this.ismousedown = true;
        this.selectCopyData = {
          startX: x,
          startY: y,
          endX: x,
          endY: y,
        };
        // console.log(this.selectCopyData)

        // 清除之前的选择
        this.clearPreviousSelection();

        // 添加全局监听器
        this.addGlobalMouseMoveListener();
        this.addGlobalMouseUpListener();

        // 初始选择单个单元格
        this.addClass();
      }
    }
  }

  getDataRowIndex(cell: HTMLElement): number {
    const row = cell.closest("tr");
    if (!row) return -1;

    // Ant Design Table 的数据行通常有特定类名
    const tbody = row.closest("tbody.ant-table-tbody");
    if (!tbody) return -1;

    // 只选择数据行（排除空状态行等）
    const dataRows = Array.from(
      tbody.querySelectorAll("tr.ant-table-row")
    ) as HTMLElement[];

    return dataRows.indexOf(row);
  }
  // 添加 ngOnDestroy 来清理资源
  ngOnDestroy() {
    this.clearPreviousSelection();
  }
}

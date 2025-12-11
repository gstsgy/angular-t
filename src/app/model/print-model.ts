import { Group, Rect, Text, IRect, IText, PointerEvent ,Image, IImage } from 'leafer-ui';
import QRCode from 'qrcode';
interface CellData {
  row: number;
  col: number;
  rowSpan?: number; // 合并用
  colSpan?: number;
  text?: string;
}
interface IQrCodeOptions extends Partial<IImage> {
    content: string;      // 要编码的内容，如 "https://example.com"
    size?: number;     // 二维码尺寸（宽高），默认 200
  }
  
class Cell extends Group {
  
  public _data: CellData;
  public bg: Rect;
  public border: Rect;
  public label: Text;

  constructor(data: CellData, width: number, height: number) {
   
    super();
    this.draggable=false;
    this._data = data;
    // 背景（无边框）
    this.bg = new Rect({
      fill: '#fff',
      width,
      height,
      interactive: true
    });

    // 边框（独立绘制，方便控制）
    this.border = new Rect({
      stroke: '#ccc',
      strokeWidth: 1,
      width,
      height,
      interactive: false // 避免干扰点击
    });

    this.label = new Text({
      text: data.text || '',
      fontSize: 14,
      x: 4,
      y: 4,
      editable: true,fill: '#32cd79',placeholder: '输入文本',
      dragBounds: 'parent', 
    });

    this.add([this.bg, this.border, this.label]);
    this.on(PointerEvent.MENU, this.onPointerDown.bind(this));
  }

  private onPointerDown(e: any) {
    if (e.buttons === 2) { // 右键
      this.emit('cellRightClick', { cell: this, event: e });
    }
  }

  setBorder(stroke: string, width: number = 1) {
    this.border.stroke = stroke;
    this.border.strokeWidth = width;
  }

  setText(text: string) {
    this.label.text = text;
  }
}

class Table extends Group {
    public rows: number;
    public cols: number;
    private cellWidth: number;
    private cellHeight: number;
    private cells: Cell[][] = [];
  
    constructor(rows: number, cols: number, cellWidth = 100, cellHeight = 40) {
      super();
      this.editable=true;
      //this.hitChildren = false
      this.rows = rows;
      this.cols = cols;
      this.cellWidth = cellWidth;
      this.cellHeight = cellHeight;
      this.render();
    }
  
    private render() {
      this.cells = [];
      this.clear();
  
      for (let r = 0; r < this.rows; r++) {
        const row: Cell[] = [];
        for (let c = 0; c < this.cols; c++) {
          const cell = new Cell({ row: r, col: c }, this.cellWidth, this.cellHeight);
          cell.x = c * this.cellWidth;
          cell.y = r * this.cellHeight;
          cell.on('cellRightClick', (e) => this.onCellRightClick(e));
          this.add(cell);
          row.push(cell);
        }
        this.cells.push(row);
      }
    }
  
    private onCellRightClick(e: any) {
      const { row, col } = e.cell._data;
      this.showContextMenu(row, col, e.event);
    }
  
    private showContextMenu(row: number, col: number, event: any) {
      // 这里可以调用全局右键菜单组件
      // 示例：使用原生 alert 模拟
      const action = prompt(`
        表格操作 (行:${row}, 列:${col})
        1: 增加行
        2: 增加列
        3: 合并右边单元格
        4: 加粗边框
      `);
  
      switch (action) {
        case '1': this.addRow(); break;
        case '2': this.addCol(); break;
        case '3': this.mergeCells(row, col, row, col + 1); break;
        case '4': this.cells[row][col].setBorder('#000', 2); break;
      }
    }
  
    addRow() {
      this.rows++;
      this.render(); // 简单重绘（生产环境可优化为增量更新）
    }
  
    addCol() {
      this.cols++;
      this.render();
    }
  
    mergeCells(r1: number, c1: number, r2: number, c2: number) {
      // 简单合并：隐藏 c2 单元格，扩展 c1 宽度
      if (c2 >= this.cols || r2 >= this.rows) return;
  
      const cell1 = this.cells[r1][c1];
      const cell2 = this.cells[r2][c2];
  
      // 隐藏 cell2
      cell2.visible = false;
  
      // 扩展 cell1 宽度（假设水平合并）
      cell1.width = this.cellWidth * 2;
      cell1.border.width = this.cellWidth * 2;
      cell1.bg.width = this.cellWidth * 2;
      cell1.label.width = this.cellWidth * 2 - 8;
    }
  }
  class QrCode extends Image {
    private _data: string;
    private _size: number;
  
    constructor(options: IQrCodeOptions) {
      // 先用占位图初始化
      super({
        width: options.size || 200,
        height: options.size || 200,
        url: '' // 后续填充
      });
      this.editable=true;
      this._data = options.content;
      this._size = options.size || 200;
  
      this.generate();
    }
  
    private async generate() {
      try {
        const dataUrl = await QRCode.toDataURL(this._data, {
          width: this._size,
          margin: 1,
          color: {
            dark: '#000',
            light: '#fff'
          }
        });
        this.url = dataUrl; // 触发 Image 重绘
      } catch (err) {
        console.error('QR Code generation failed:', err);
      }
    }
  
    // 更新内容
    setData(data: string) {
      this._data = data;
      this.generate();
    }
  
    // 更新尺寸
    setSize(size: number) {
      this._size = size;
      this.width = size;
      this.height = size;
      this.generate();
    }
  }
  export { Table, Cell, QrCode }
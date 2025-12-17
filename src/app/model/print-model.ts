import { Group, Rect, Text, IRect, IText, PointerEvent ,Image, IImage, BoundsEvent  } from 'leafer-ui';
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
  public label: Text;

  constructor(data: CellData, width: number, height: number) {
   
    super();
    this.draggable=false;
    this._data = data;
    // 背景（无边框）
    // this.bg = new Rect({
    //   fill: '#fff',
    //   width,
    //   height,
    //   interactive: true
    // });
    this.bg = new Rect({
      fill: '#fff',
      x: 1,
      y: 1,
      width: width - 2,
      height: height - 2,
      interactive: true
    });
    // 边框（独立绘制，方便控制）
    // this.border = new Rect({
    //   stroke: '#000',
    //   strokeWidth: 1,
    //   width,
    //   height,
    //   interactive: false // 避免干扰点击
    // });

    this.label = new Text({
      text: data.text || '',
      fontSize: 14,
      x: 4,
      y: 4,
      editable: true,fill: '#32cd79',placeholder: '输入文本',
      dragBounds: 'parent', 
    });

    this.add([this.bg,  this.label]);
    this.on(PointerEvent.MENU, this.onPointerDown.bind(this));
  }

  private onPointerDown(e: any) {
    if (e.buttons === 2) { // 右键
      this.emit('cellRightClick', { cell: this, event: e });
    }
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
    private cells: (Cell|null)[][] = [];
    private mergeRegions: { r1: number; c1: number; r2: number; c2: number }[] = [];
  
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
      this.clear();
      this.cells = [];
      // === 新增：绘制网格线 ===
  const gridLines = new Group();

  // 1. 垂直线（cols + 1 条）
  for (let c = 0; c <= this.cols; c++) {
    const x = c * this.cellWidth;
    gridLines.add(new Rect({
      x,
      y: 0,
      width: 1,
      widthRange :{ min: 1, max: 1 },
      editable: true,
      height: this.rows * this.cellHeight,
      fill: '#000'
    }));
  }

  // 2. 水平线（rows + 1 条）
  for (let r = 0; r <= this.rows; r++) {
    const y = r * this.cellHeight;
    gridLines.add(new Rect({
      x: 0,
      y,
      editable: true,
      width: this.cols * this.cellWidth,
      height: 1,
      heightRange  :{ min: 1, max: 1 },
      fill: '#000'
    }));
  }
  this.add(gridLines);
      // 辅助函数：判断 (r, c) 是否是某个合并区域的主单元格（左上角）
      const getMergeRegion = (r: number, c: number) => {
        return this.mergeRegions.find(m => m.r1 === r && m.c1 === c);
      };
    
      // 辅助函数：判断 (r, c) 是否被某个合并区域覆盖（且不是主单元格）
      const isCovered = (r: number, c: number) => {
        return this.mergeRegions.some(m =>
          r >= m.r1 && r <= m.r2 &&
          c >= m.c1 && c <= m.c2 &&
          !(r === m.r1 && c === m.c1) // 排除主单元格
        );
      };
    
      for (let r = 0; r < this.rows; r++) {
        const row: (Cell | null)[] = [];
        for (let c = 0; c < this.cols; c++) {
          // 如果被覆盖（非主单元格），跳过
          if (isCovered(r, c)) {
            row.push(null);
            continue;
          }
    
          // 检查是否是主单元格
          const merge = getMergeRegion(r, c);
          const width = merge ? (merge.c2 - merge.c1 + 1) * this.cellWidth : this.cellWidth;
          const height = merge ? (merge.r2 - merge.r1 + 1) * this.cellHeight : this.cellHeight;
    
          const cell = new Cell({ row: r, col: c, text: '' }, width, height);
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
        //case '4': this.cells?[row][col]?.setBorder('#000', 2); break;
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
      const top = Math.min(r1, r2);
      const left = Math.min(c1, c2);
      const bottom = Math.max(r1, r2);
      const right = Math.max(c1, c2);
    
      if (bottom >= this.rows || right >= this.cols) return;
    
      // 检查区域内是否有其他合并冲突（简化版：不允许重叠）
      for (let r = top; r <= bottom; r++) {
        for (let c = left; c <= right; c++) {
          if (this.isCellInAnyMerge(r, c)) {
            console.warn('合并区域重叠，取消操作');
            return;
          }
        }
      }
    
      // 只记录左上角为主单元格
      this.mergeRegions.push({
        r1: top,
        c1: left,
        r2: bottom,
        c2: right
      });
    
      this.render();
    }
    
    // 判断 (r,c) 是否在任何合并区域内（包括主单元格）
    private isCellInAnyMerge(r: number, c: number): boolean {
      return this.mergeRegions.some(m =>
        r >= m.r1 && r <= m.r2 &&
        c >= m.c1 && c <= m.c2
      );
    }
    unmergeCell(r: number, c: number) {
      this.mergeRegions = this.mergeRegions.filter(m => !(m.r1 === r && m.c1 === c));
      this.render();
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
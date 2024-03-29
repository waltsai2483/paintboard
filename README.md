# Assignment 1 - Web Canvas

## UI Design
<img alt="Preview" src="https://imgur.com/XnBAzMt.png" style="width: 100%;">

### UI 結構
 * 上方橫排-**控制欄**: 控制功能 (undo/redo、上下載、畫布重置)
 * 下方橫排-**圖層欄**: 圖層功能 (繪圖層級、透明度、拉伸變換)
 * 左側邊列-**工具列**: 繪圖工具 (繪製/擦除、文字、形狀)
 * 右側編列-**屬性列**: 繪圖屬性 (寬度、對齊、顏色)
### UI 互動
* 將滑鼠移至指定欄時會降低透明度並彈出
* 使用繪圖工具時會將UI隱藏，以避免其影響繪製過程

## Paint Tools

調整**屬性列**的各項數值以更改繪圖屬性，分為字型、顏色、圖形三項主區塊
* **字型區:** 調整文字模式下的字型與文字對齊方向
* **顏色區:** 調整畫筆/邊框顏色，同時顯示近期使用的顏色以方便使用者選擇
* **圖形區:** 調整畫筆/邊框寬度與圖形內部填色
  * 按下填色區的 圓形按鈕 或按鍵 <kbd>F</kbd> 以開啟/關閉填色
  * 點擊右側的矩形可以將選擇的填色改成**與畫筆顏色相同的顏色**

<br>
<img alt="Preview" src="https://imgur.com/38AeGNH.gif" style="width: 100%; box-shadow: 0px 0px 5px 0.25px #dddddd;">
<br>

### 繪筆/橡皮擦工具
* 按下**工具列**上的 繪筆按鈕 或 <kbd>數字鍵1</kbd> 以切換為 繪筆模式
* 按下**工具列**上的 橡皮擦按鈕 或 <kbd>數字鍵2</kbd> 以切換為 擦除模式

<br>
<img alt="Preview" src="https://imgur.com/sH2Wp9Y.gif" style="width: 100%; box-shadow: 0px 0px 5px 0.25px #dddddd;">

### 文字工具
* 按下**工具列**上的 文字按鈕 或 <kbd>數字鍵3</kbd> 以切換為 文字模式

<br>

### 圖形工具
選擇**工具列**上的 後四個按鈕 以切換為對應的圖形模式

* 左鍵拖動時可以調整圖形長度/寬度
* 顯示對應圖形的輪廓與方框供使用者對準
### 

<br><img alt="Preview" src="https://imgur.com/x2tXQGy.gif" style="width: 100%; box-shadow: 0px 0px 5px 0.25px #dddddd;"><br>

* **圓形模式**: 按下 圓形按鈕 或 <kbd>數字鍵4</kbd> 以繪製橢圓形
  * 按下 <kbd>Shift</kbd> 以改為繪製正圓形

<br><img alt="Preview" src="https://imgur.com/3yMl9RV.gif" style="width: 100%; box-shadow: 0px 0px 5px 0.25px #dddddd;"><br>

* **直線模式**: 按下 直線按鈕 或 <kbd>數字鍵5</kbd> 以繪製直線
  * 按下 <kbd>Shift</kbd> 以改為繪製水平/垂直線或45度斜線 (根據滑鼠位置調整角度) 

<br><img alt="Preview" src="https://imgur.com/z40GqPX.gif" style="width: 100%; box-shadow: 0px 0px 5px 0.25px #dddddd;"><br>

* **方形模式**: 按下 方形按鈕 或 <kbd>數字鍵6</kbd> 以繪製矩形
  * 按下 <kbd>Shift</kbd> 以改為繪製正方形

<br><img alt="Preview" src="https://imgur.com/fKqSeXs.gif" style="width: 100%; box-shadow: 0px 0px 5px 0.25px #dddddd;"><br>

* **三角模式**: 按下 三角按鈕 或 <kbd>數字鍵7</kbd> 以繪製三角形
  * 按下 <kbd>Shift</kbd> 以改為繪製長寬相等的三角形

##

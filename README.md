# Assignment 1 - Web Canvas

## UI Design
<img alt="Preview" src="https://imgur.com/XnBAzMt.png" style="width: 100%;">

### UI 結構
 * 上方橫排-**控制欄**: 控制功能 (撤銷/重做、載入/下載、畫布重置)
 * 下方橫排-**圖層欄**: 圖層功能 (繪圖層級、透明度、拉伸變換)
 * 左側邊列-**工具列**: 繪圖工具 (繪製/擦除、文字、形狀)
 * 右側編列-**屬性列**: 繪圖屬性 (寬度、對齊、顏色)
### UI 互動
* 將滑鼠移至指定欄時會降低透明度並彈出
* 使用繪圖工具時會將UI隱藏，以避免其影響繪製過程

## Paint Tools

調整**屬性列**的各項數值以更改繪圖屬性，分為字型、顏色、圖形三項主區塊

<img alt="Preview" src="https://imgur.com/S11JyTC.png" style="width: 100%; box-shadow: 0px 0px 5px 0.25px #dddddd;"><br>

* **字型區:** 調整文字模式下的字型與文字對齊方向
    * 文字對齊分為靠左、置中和靠右，會更改文字在框選範圍的位置
* **顏色區:** 調整畫筆/邊框/文字顏色
    * 按下 方形色塊按鈕 後將彈出視窗，並以HSL標示方法選色
    * 選色後會顯示近期使用的顏色以方便使用者選擇
* **圖形區:** 調整畫筆/邊框寬度與圖形內部填色
    * <kbd>[</kbd> 鍵能放大畫筆/邊框的寬度， <kbd>]</kbd> 鍵則可以縮小
    * 按下填色區的 圓形按鈕 或按鍵 <kbd>F</kbd> 以開啟/關閉填色
    * 點擊右側的矩形可以將選擇的填色改成**與顏色區的選色相同的顏色**
* 按下 <kbd>C</kbd> 鍵能夠開啟/關閉滑鼠的十字對準線以供參考
### 

<br>
<img alt="Preview" src="https://imgur.com/OfWNev7.gif" style="width: 100%; box-shadow: 0px 0px 5px 0.25px #dddddd;">

### 抓取工具
* 按下**工具列**上的 手掌按鈕 或 <kbd>數字鍵1</kbd> 以切換為 抓取模式
    * 拖動以調整選擇圖層的位置

<img alt="Preview" src="https://imgur.com/38AeGNH.gif" style="width: 100%; box-shadow: 0px 0px 5px 0.25px #dddddd;">

### 繪筆/橡皮擦工具
* 按下**工具列**上的 繪筆按鈕 或 <kbd>數字鍵2</kbd> 以切換為 繪筆模式
* 按下**工具列**上的 橡皮擦按鈕 或 <kbd>數字鍵3</kbd> 以切換為 擦除模式

<br>
<img alt="Preview" src="https://imgur.com/sH2Wp9Y.gif" style="width: 100%; box-shadow: 0px 0px 5px 0.25px #dddddd;">

### 文字工具
* 按下**工具列**上的 文字按鈕 或 <kbd>數字鍵4</kbd> 以切換為 文字模式
* 左鍵拖動可框選一塊文字輸入欄，輸入完成後按 <kbd>Enter</kbd> 會繪製到畫板上
    * 按下 <kbd>Shift</kbd> 以改為正方形區域
    * 字體支援: 在**字型區**中的字型選單中選擇字體
    * 對齊方向: 在**字型區**選擇文字的對齊方式(靠左/置中/靠右)
    * 文字寬度: 文字寬度即為輸入欄的高度，拖動時會提供框選的寬高以供參考
    * 文字縮放: 文字超過欄位時會強制將其橫向縮進範圍內
<br>

### 圖形工具
選擇**工具列**上的 後四個按鈕 以切換為對應的圖形模式

* 左鍵拖動時可以調整圖形長度/寬度
* 顯示對應圖形的輪廓與方框供使用者對準

<br><img alt="Preview" src="https://imgur.com/x2tXQGy.gif" style="width: 100%; box-shadow: 0px 0px 5px 0.25px #dddddd;">

* **圓形模式**: 按下 圓形按鈕 或 <kbd>數字鍵5</kbd> 以繪製橢圓形
  * 按下 <kbd>Shift</kbd> 以改為繪製正圓形

<br><img alt="Preview" src="https://imgur.com/3yMl9RV.gif" style="width: 100%; box-shadow: 0px 0px 5px 0.25px #dddddd;">

* **直線模式**: 按下 直線按鈕 或 <kbd>數字鍵6</kbd> 以繪製直線
  * 按下 <kbd>Shift</kbd> 以改為繪製水平/垂直線或45度斜線 (根據滑鼠位置調整角度) 

<br><img alt="Preview" src="https://imgur.com/z40GqPX.gif" style="width: 100%; box-shadow: 0px 0px 5px 0.25px #dddddd;">

* **方形模式**: 按下 方形按鈕 或 <kbd>數字鍵7</kbd> 以繪製矩形
  * 按下 <kbd>Shift</kbd> 以改為繪製正方形

<br><img alt="Preview" src="https://imgur.com/fKqSeXs.gif" style="width: 100%; box-shadow: 0px 0px 5px 0.25px #dddddd;">

* **三角模式**: 按下 三角按鈕 或 <kbd>數字鍵8</kbd> 以繪製三角形
  * 按下 <kbd>Shift</kbd> 以改為繪製長寬相等的三角形

## Layer
<img alt="Preview" src="https://imgur.com/yNJzKZF.png" style="width: 100%; box-shadow: 0px 0px 5px 0.25px #dddddd;"><br>

**圖層欄**左側的選單支援與圖層相關的功能，透過鍵入16個字元以內的圖層名稱並按下 Add 按鈕或 <kbd>Enter</kbd> 可以新增一個圖層。圖層具有以下屬性: 
* 獨立畫板與儲存區互不干涉，且能獨立撤銷/重做
* 拖動圖層方塊以調整圖層間的重疊順序(覆蓋左側的圖層，並被右側的圖層覆蓋)
* 按下方塊右下方的 × 按鍵以刪除圖層
* 可控制各圖層的透明度

## Control

<img alt="Preview" src="https://imgur.com/wyDx3RY.png" style="width: 100%; box-shadow: 0px 0px 5px 0.25px #dddddd;"><br>

**控制欄**支援許多控制畫板的功能，另一些功能可以透過快捷鍵來完成

### 撤銷/重做
* 按下**控制欄**左側的 左指按鈕 或使用快捷鍵 <kbd>Ctrl+Z</kbd> 能將選定圖層回退一個階段
* 按下**控制欄**左側的 右指按鈕 或使用快捷鍵 <kbd>Ctrl+X</kbd> 可將選定圖層前進一個階段

### 新建
* 按下**控制欄**右側的 新建按鈕 會詢問是否重啟畫板，若選擇是則會清空**所有圖層**
   * 可自由調整畫板的寬度/高度，輸入"default"將會調整為正常大小(1080x720)

### 載入
* 按下**控制欄**右側的 載入按鈕 將開啟載入視窗以便選擇插入的圖片
* 插入後將詢問是否根據插入的圖片調整畫板大小(其他圖層也會一併調整!)
    * 若選擇是則其他圖層會調整成圖片的大小
    * 若選擇否則該圖片會被縮放成畫框的大小
* 插入的圖片會以**圖層**形式儲存

### 下載
* 按下**控制欄**右側的 下載按鈕 將開啟下載視窗，將所有圖層在畫板上的影像儲存成png檔
* 不會保存圖層資訊

### 縮放/移動
* 使用 <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> 能夠移動畫板的位置，使用 <kbd>滾輪上/下</kbd> 則可以縮放畫板
* 按住 <kbd>Shift</kbd> 能夠加快移動速度

# jGE.js API 文档

> 一个轻量级 2D 游戏/交互引擎，基于 Canvas 实现，提供向量运算、图形渲染、资源管理、事件系统、场景调度及虚拟键盘等核心功能。

---

## 目录

- [全局常量与工具函数](#全局常量与工具函数)
- [Vector2D —— 二维向量类](#vector2d--二维向量类)
- [渲染对象体系](#渲染对象体系)
  - [ShowObj —— 显示对象容器](#showobj--显示对象容器)
  - [$$tk_base —— 图形部件基类](#tk_base--图形部件基类)
  - [$tk_path —— 路径图形](#tk_path--路径图形)
  - [$tk_ellipse —— 椭圆/圆](#tk_ellipse--椭圆圆)
  - [$tk_arc —— 圆弧](#tk_arc--圆弧)
  - [$tk_sprite —— 图像精灵](#tk_sprite--图像精灵)
  - [$tk_animation —— 动画精灵](#tk_animation--动画精灵)
  - [$tk_video —— 视频部件](#tk_video--视频部件)
  - [$tk_font —— 文字部件](#tk_font--文字部件)
- [jGE —— 引擎核心类](#jge--引擎核心类)
- [管理器模块](#管理器模块)
  - [EventManager —— 事件管理器](#eventmanager--事件管理器)
  - [ResourceManager —— 资源管理器](#resourcemanager--资源管理器)
  - [SceneManager —— 场景管理器](#scenemanager--场景管理器)
- [交互模块](#交互模块)
  - [Keyboard —— 虚拟键盘](#keyboard--虚拟键盘)
  - [Key —— 按键对象](#key--按键对象)
  - [DragHelper —— 拖拽助手](#draghelper--拖拽助手)
- [附录](#附录)

---

## 全局常量与工具函数

### 常量

| 常量名 | 值 | 说明 |
|--------|-----|------|
| `π` | `Math.PI` | 圆周率 π |
| `π2` | `2 * π` | 2π |
| `π_hf` | `0.5 * π` | ½π |

### `RandomClamped()`

获取 `[-1, 1]` 范围内的随机浮点数。

```javascript
function RandomClamped()
```

**返回值**: `number` —— 范围 `[-1, 1]` 的随机数，正负各 50% 概率。

### `GetEventPosition(event)`

从 DOM 事件对象中提取坐标，兼容鼠标和触摸事件。

```javascript
function GetEventPosition(event)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `event` | `Event` | DOM 事件对象 |

**返回值**: `Vector2D` —— 包含 `x`、`y` 坐标的向量。

---

## Vector2D —— 二维向量类

### 构造函数

```javascript
new Vector2D(x, y)
new Vector2D({x, y})
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `x` / `y` | `number` | `0` | 坐标值，或传入 `{x, y}` 对象 |
| `obj` | `Object` | — | 可选：包含 `x`、`y` 属性的对象 |

---

### 实例属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `x` | `number` | X 坐标（getter/setter），设置时自动更新 `speed` 和 `va` |
| `y` | `number` | Y 坐标（getter/setter），设置时自动更新 `speed` 和 `va` |
| `speed` | `number` | 向量模长（只读，随 x/y 自动更新） |
| `va` | `number` | 向量方向角（弧度），范围 `[0, 2π)`（只读） |

---

### 实例方法

#### `Velocity(speed, angle)`
用极坐标方式设置向量。

```javascript
vec.Velocity(speed, angle)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `speed` | `number` | 向量模长 |
| `angle` | `number` | 方向角（弧度） |

---

#### `Copy(v2)`
从另一个向量复制值。

```javascript
vec.Copy(v2)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `v2` | `Vector2D` | 源向量 |

---

#### `Cloen()` ⚠️ 拼写保持与原代码一致
克隆当前向量。

```javascript
const newVec = vec.Cloen()
```

**返回值**: `Vector2D` —— 新的向量副本。

---

#### `Length()` / `LengthSq()`
计算向量模长或模长平方。

```javascript
const len = vec.Length()
const lenSq = vec.LengthSq()
```

**返回值**: `number`

---

#### `Normalize()`
返回归一化单位向量。

```javascript
const unitVec = vec.Normalize()
```

**返回值**: `Vector2D` —— 若零向量则返回 `(0, 0)`。

---

#### `Dot(v2)`
计算点积。

```javascript
const dot = vec.Dot(v2)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `v2` | `Vector2D` | 另一向量 |

**返回值**: `number`

---

#### `Distance(v2)` / `DistanceSq(v2)`
计算到另一向量的距离或距离平方。

```javascript
const dist = vec.Distance(v2)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `v2` | `Vector2D` | 另一向量 |

**返回值**: `number`

---

#### `Add(v2)` / `Minus(v2)` / `Multiply(a)`
向量加减乘（返回新向量）。

```javascript
const result = vec.Add(v2)
const result = vec.Minus(v2)
const result = vec.Multiply(2)
```

**返回值**: `Vector2D`

---

#### `AddIn(v2)` / `MinusIn(v2)` / `MultiplyIn(a)`
向量就地加减乘（修改自身）。

```javascript
vec.AddIn(v2)      // this += v2
vec.MinusIn(v2)    // this -= v2
vec.MultiplyIn(2)  // this *= 2
```

**返回值**: `this`（链式调用支持）

---

#### `Turn(A)`
旋转向量。

```javascript
const rotated = vec.Turn(angle)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `A` | `number` | 旋转角度（弧度） |

**返回值**: `Vector2D` —— 旋转后的新向量。

---

#### `Equal(v2)`
判断两向量是否相等。

```javascript
const isEqual = vec.Equal(v2)
```

**返回值**: `boolean`

---

#### 迭代器支持
```javascript
for (const val of vec) {
    // val: x, y
}
```

---

## 渲染对象体系

### ShowObj —— 显示对象容器

继承自 `Vector2D`，是场景中可显示对象的基础容器，管理子对象的添加、更新与渲染。

#### 构造函数

```javascript
new ShowObj({ x, y, angle, obj })
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `x` | `number` | `0` | 容器 X 坐标 |
| `y` | `number` | `0` | 容器 Y 坐标 |
| `angle` | `number` | `0` | 容器旋转角（弧度） |
| `obj` | `Array` | `null` | 初始子对象列表 |

#### 实例属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `isDel` | `boolean` | 标记对象是否待删除 |
| `angle` | `number` | 旋转角（弧度） |
| `visible` | `boolean` | 是否可见 |

#### 实例方法

##### `add(...objects)`
添加子对象到容器。

```javascript
container.add(obj1, obj2, ...)
```

**返回值**: `this`（链式调用）

##### `del(object)`
标记子对象为删除。

```javascript
container.del(obj)
```

##### `update(t, parentPos, parentAngle)`
更新所有子对象。

```javascript
container.update(deltaTime, parentPosition, parentAngle)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `t` | `number` | 帧间隔时间（毫秒） |
| `parentPos` | `Vector2D` | 父级位置 |
| `parentAngle` | `number` | 父级旋转角 |

##### `render(ctx)`
渲染所有子对象。

```javascript
container.render(ctx)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `ctx` | `CanvasRenderingContext2D` | Canvas 上下文 |

##### `updateHandler`
设置容器的更新回调。

```javascript
container.updateHandler = function(t, pos, angle) {
    // 自定义更新逻辑
}
```

---

### $$tk_base —— 图形部件基类

所有渲染部件（`$tk_*`）的抽象基类，封装了 Canvas 绘制样式和变换。

#### 构造函数

```javascript
new $$tk_base({ styleType, style, pos, update })
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `styleType` | `"fill"` \| `"stroke"` \| `"both"` | `null` | 绘制模式 |
| `style` | `string` \| `Object` | `null` | 样式字符串或配置对象 |
| `pos` | `Vector2D` \| `Array` | `(0,0)` | 位置 |
| `update` | `Function` | `null` | 更新回调 |

#### 实例属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `fillStyle` | `string` | 填充颜色 |
| `strokeStyle` | `string` | 描边颜色 |
| `lineWidth` | `number` | 线条宽度 |
| `lineCap` | `string` | 线条端点样式 |
| `lineJoin` | `string` | 线条连接样式 |
| `alpha` | `number` | 透明度 `[0,1]` |
| `pos` | `Vector2D` | 相对位置 |
| `angle` | `number` | 旋转角（弧度） |
| `centerPoint` | `Vector2D` | 世界空间中的中心点 |
| `isDel` | `boolean` | 是否待删除 |

---

### $tk_path —— 路径图形

绘制由点和线段组成的路径。

#### 构造函数

```javascript
new $tk_path({
    styleType, style,
    points,      // 点数组: [[x,y], Vector2D, ...]
    pos,
    update
})
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `points` | `Array` | 顶点数组，末尾 `-1` 表示闭合路径 |

#### 实例方法

##### `clone()`
克隆当前路径对象。

```javascript
const copy = path.clone()
```

**返回值**: `$tk_path`

---

### $tk_ellipse —— 椭圆/圆

绘制椭圆或正圆。

#### 构造函数

```javascript
new $tk_ellipse({
    styleType, style,
    pos,
    a,      // 短轴半径
    b,      // 长轴半径
    r,      // 半径（设置 r 时忽略 a、b）
    update
})
```

---

### $tk_arc —— 圆弧

绘制圆弧或弧线。

#### 构造函数

```javascript
new $tk_arc({
    styleType, style,
    radius,
    cenPoin,            // 圆心 [x, y]
    startAngle,         // 起始角（弧度），默认 0
    endAngle,           // 结束角（弧度），默认 π/2
    anticlockwise,      // 逆时针，默认 true
    startPoin,          // arcTo 起始点
    endPoin,            // arcTo 结束点
})
```

---

### $tk_sprite —— 图像精灵

绘制图像。

#### 构造函数

```javascript
new $tk_sprite({
    img,        // Image 对象
    pos,        // 位置 [x, y]
    area,       // 显示尺寸 { width, height }
    sarea,      // 源裁切区 { x, y, width, height }
    update
})
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `img` | `Image` | 图像对象（必须） |
| `area` | `Object` | 显示尺寸，默认使用图片原始尺寸 |
| `sarea` | `Object` | 源图裁切区域 |

#### 实例方法

##### `scale(rate)`
缩放精灵尺寸。

```javascript
sprite.scale(0.5)  // 缩小到 50%
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `rate` | `number` | 缩放倍率 |

---

### $tk_animation —— 动画精灵

基于 Sprite Sheet 的逐帧动画。

#### 构造函数

```javascript
new $tk_animation({
    img,        // 精灵图
    pos,
    area,       // 精灵图区域 { x, y, width, height }
    frame,      // 总帧数
    farea,      // 单帧尺寸 { width, height }（必须）
    fps,        // 播放速度（帧/秒），默认 8
    update
})
```

---

### $tk_video —— 视频部件

播放视频，继承自 `$tk_sprite`。

#### 构造函数

```javascript
new $tk_video({
    video,      // HTMLVideoElement
    pos,
    area,       // 显示尺寸
    update
})
```

#### 实例方法

##### `pause(isStop)`
暂停/播放视频。

```javascript
video.pause()       // 暂停
video.pause(false)  // 播放
```

##### `loop(isLoop)`
设置循环播放。

```javascript
video.loop(true)   // 开启循环
```

##### `silent(isSilent)`
设置静音。

```javascript
video.silent(true)   // 静音
video.silent(false)  // 有声
```

---

### $tk_font —— 文字部件

绘制文本。

#### 构造函数

```javascript
new $tk_font({
    text,           // 文字内容
    styleType,      // "fill" | "stroke" | "both"
    style,          // 样式
    font,           // CSS 字体字符串，如 "22px 微软雅黑"
    angle,          // 旋转角
    pos,
    update
})
```

#### 实例方法

##### `text(newText)`
更新文字内容。

```javascript
font.text("新文字")
```

##### `fontColor`
设置文字颜色。

```javascript
font.fontColor = "#ff0000"
```

---

## jGE —— 引擎核心类

继承自 `ShowObj`，是游戏引擎的主入口。

### 构造函数

```javascript
const engine = new jGE(config)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `config` | `Object` | 引擎配置对象 |

#### 配置对象

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `id` | `string` | 自动生成 | Canvas 元素 ID |
| `width` | `number` | `1280` | 画布宽度 |
| `height` | `number` | `640` | 画布高度 |
| `fps` | `number` | `30` | 目标帧率 |
| `isRoundWorld` | `boolean` | `true` | 是否启用环绕世界 |

---

### 实例属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `version` | `Array` | 版本号 `[大, 中, 小]` |
| `run` | `Object` | 运行时状态（内部） |
| `backgroundColor` | `string` | 背景色（getter/setter） |

---

### 实例方法

#### `SetConfig(cfg)`
设置引擎配置。

```javascript
engine.SetConfig({ width: 1920, height: 1080 })
```

---

#### `Init(cfg)`
初始化引擎（通常在构造时自动调用，除非需要延迟初始化）。

```javascript
engine.Init(config)
```

---

#### `update(t)`
主动触发更新循环（通常自动调用）。

```javascript
engine.update(deltaTime)
```

---

#### `render()`
主动触发渲染（通常自动调用）。

```javascript
engine.render()
```

---

#### `add(obj)`
向引擎添加对象。

```javascript
engine.add(new ShowObj())
engine.add(new Keyboard(engine))
```

支持自动识别对象类型：
- `Manager` → 加入管理器集合
- `Keyboard` → 加入键盘管理
- 其他 → 作为普通显示对象

---

#### `clean()`
清空所有渲染和更新队列。

```javascript
engine.clean()
```

---

#### `GetDom()`
获取 Canvas DOM 元素。

```javascript
const canvas = engine.GetDom()
```

**返回值**: `HTMLCanvasElement`

---

#### `Pause()`
切换暂停/继续状态。

```javascript
engine.Pause()
```

---

#### `GetArea()`
获取画布尺寸。

```javascript
const { width, height } = engine.GetArea()
```

**返回值**: `{ width, height }`

---

#### `GetSetting()`
获取引擎配置副本。

```javascript
const config = engine.GetSetting()
```

---

#### `IsInIt(point, path)`
判断点是否在路径内部。

```javascript
const isInside = engine.IsInIt(point, path)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `point` | `Vector2D` | 检测点 |
| `path` | `$tk_path` | 路径对象 |

**返回值**: `boolean`

---

#### `OnMouse(action, handler, target)`
绑定鼠标事件。

```javascript
engine.OnMouse("click", function(e) {
    // 处理点击
}, this)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `action` | `string` | DOM 事件名（如 `"click"`） |
| `handler` | `Function` | 事件处理函数 |
| `target` | `Object` | `handler` 的 `this` 绑定 |

---

#### `InitMessage(model)`
为外部模块注入事件接口。

```javascript
const myModule = {};
engine.InitMessage(myModule);
// myModule 现在拥有 on, one, broadcast 方法
```

---

#### 事件接口

引擎实例本身也暴露了事件方法：

```javascript
// 绑定长期事件
engine.on("eventName", (data) => {})

// 绑定一次性事件
engine.one("eventName", (data) => {})

// 触发事件
engine.broadcast("eventName", { key: "value" })
```

---

## 管理器模块

### EventManager —— 事件管理器

负责事件分发与生命周期管理。事件队列在每次 `update` 后清空。

#### 创建

```javascript
new EventManager(engine)
```

#### 事件方法（由引擎代理）

| 方法 | 说明 |
|------|------|
| `engine.on(event, callback)` | 绑定长期事件 |
| `engine.one(event, callback)` | 绑定一次性事件 |
| `engine.broadcast(event, data)` | 触发事件 |

#### 内置事件

| 事件名 | 触发时机 |
|--------|----------|
| `jGE.Resource.Finish` | 所有资源加载完成 |
| `jGE.Resource.Package.Finish` | 单个资源包加载完成 |
| `jGE.Scene.Logo.End` | Logo 展示结束 |

---

### ResourceManager —— 资源管理器

负责加载、缓存和管理资源（图片、视频、音频、JSON 等）。

#### 创建

```javascript
new ResourceManager(engine)
```

#### 实例方法

##### `LoadResPackage(packid, resources)`
批量加载资源包。

```javascript
engine.ResourceManager.LoadResPackage("characters", [
    { type: "image", url: "hero.png", id: "hero" },
    { type: "json", url: "data.json", id: "config" }
])
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `packid` | `string` | 资源包唯一标识 |
| `resources` | `Array` | 资源描述数组 |

##### `LoadRes(packid, resource)`
加载单个资源。

```javascript
engine.ResourceManager.LoadRes("default", {
    type: "image",
    url: "sprite.png",
    id: "sprite"
})
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `packid` | `string` | 资源包 ID |
| `resource` | `Object` | 资源描述对象 |

资源描述字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | `"image"` \| `"json"` \| `"video"` \| `"audio"` \| `"script"` | 资源类型 |
| `url` | `string` | 资源 URL |
| `id` | `string` | 资源 ID（用于后续获取） |
| `method` | `string` | HTTP 方法，默认 `"POST"` |

##### `GetRes(id, packid)`
获取已加载资源。

```javascript
const img = engine.ResourceManager.GetRes("hero", "characters")
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `id` | `string` | — | 资源 ID |
| `packid` | `string` | `""` | 资源包 ID |

**返回值**: 资源对象（`Image`、`Object` 等），若未加载则返回 `null`

##### `UnLoadResPackage(packid)`
卸载资源包。

```javascript
engine.ResourceManager.UnLoadResPackage("characters")
```

**返回值**: `boolean` —— 是否成功

##### `GetPkProcessing(packid)`
获取资源包加载进度。

```javascript
const progress = engine.ResourceManager.GetPkProcessing("characters")
```

**返回值**: `number` —— `[0, 1]` 范围

---

### SceneManager —— 场景管理器

负责场景切换与 Logo 展示。

#### 创建

```javascript
new SceneManager(engine)
```

#### 内置行为

- 引擎启动时自动展示 Logo（约 1.5 秒）
- Logo 结束后广播 `"jGE.Scene.Logo.End"` 事件

#### 实例方法

##### `InitScene(cfg)`
初始化场景配置（由事件触发）。

```javascript
sceneManager.InitScene(sceneConfigArray)
```

##### `PlayScene()`
播放下一个场景。

```javascript
sceneManager.PlayScene()
```

---

## 交互模块

### Keyboard —— 虚拟键盘

管理一组虚拟按键，支持鼠标/触摸交互。

#### 构造函数

```javascript
new Keyboard(engine)
```

#### 实例方法

##### `add(key)`
添加按键对象。

```javascript
keyboard.add(new Key({ ... }))
```

##### `get(keyCode)`
通过按键码获取按键对象。

```javascript
const key = keyboard.get("Space")
```

##### `SetPos(pos)`
设置虚拟键盘整体位置。

```javascript
keyboard.SetPos({ x: 100, y: 200 })
keyboard.SetPos([100, 200])
```

##### `turnOn()` / `turnOff()`
启用/禁用键盘交互。

```javascript
keyboard.turnOn()
keyboard.turnOff()
```

#### 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `VirtualKeyboard` | `ShowObj` | 虚拟键盘的显示对象容器 |

---

### Key —— 按键对象

代表一个可交互的按键。

#### 构造函数

```javascript
new Key({
    key,        // 按键显示名
    code,       // 按键标识码
    handler,    // 事件处理器
    upObjs,     // 常态显示对象数组
    downObjs,   // 按下态显示对象数组
    hoverObj,   // 悬停态显示对象数组
    actObj,     // 感应区域对象
    x, y, angle // 位置与旋转
})
```

#### 实例方法

##### `addEventListener(type, handler)`
绑定按键事件。

```javascript
key.addEventListener("keydown", (e) => {})
key.addEventListener("keyup", (e) => {})
```

支持的事件类型：

| 类型 | 说明 |
|------|------|
| `keydown` | 按下 |
| `keyup` | 抬起 |
| `over` | 鼠标悬停 |
| `out` | 鼠标移出 |
| `scroll` | 滚动（鼠标滚轮） |

##### `removeEventListener(type)`
移除指定类型的所有事件监听。

```javascript
key.removeEventListener("keydown")
```

##### `on(event)`
处理输入事件（内部调用，通常无需手动调用）。

```javascript
key.on({ type: "keydown", code: "Space", x: 100, y: 200 })
```

---

### DragHelper —— 拖拽助手

为按键添加拖拽功能的工具类。

#### 静态方法

##### `DragHelper.InitDrag(key, callbacks)`

为按键对象初始化拖拽能力。

```javascript
DragHelper.InitDrag(key, {
    startCallback: function(e) {
        // 开始拖拽
    },
    moveCallback: function(startPos, currentPos) {
        // 拖拽移动
    },
    endCallback: function(e) {
        // 结束拖拽
    },
    scrollCallback: function(delta) {
        // 滚轮滚动
    }
})
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `key` | `Key` | 按键对象 |
| `callbacks` | `Object` | 回调函数集合 |
| `callbacks.startCallback` | `Function` | 拖拽开始回调 |
| `callbacks.moveCallback` | `Function` | 拖拽移动回调，参数 `(startPos, currentPos)` |
| `callbacks.endCallback` | `Function` | 拖拽结束回调 |
| `callbacks.scrollCallback` | `Function` | 滚轮回调，参数 `(delta)` |

#### 使用示例

```javascript
const key = new Key({ ... });
DragHelper.InitDrag(key, {
    startCallback: function(e) { console.log("开始拖动", e); },
    moveCallback: function(start, current) {
        this.pos.x += current.x - start.x;
        this.pos.y += current.y - start.y;
    },
    endCallback: function(e) { console.log("拖动结束", e); }
});
```

---

## 附录

### 样式字符串规范

| 样式类型 | 格式 | 示例 |
|----------|------|------|
| 描边 `stroke` | `"color lineWidth lineCap lineJoin"` | `"#ff0000 2 round round"` |
| 填充 `fill` | `"color"` | `"#00ff00"` |
| 两者 `both` | `{ fillStyle, strokeStylest }` | `{ fillStyle: "#000", strokeStylest: "#fff 2" }` |

### 坐标系统

- **Y 轴朝下**（与 Canvas 保持一致）
- 角度以**弧度**为单位
- 旋转方向：**顺时针**为正

### 资源加载支持格式

| 类型 | 说明 |
|------|------|
| `image` | 图片资源，返回 `Image` 对象 |
| `json` | JSON 数据，返回解析后的对象 |
| `video` | 视频资源，返回 `HTMLVideoElement` |
| `audio` | 音频资源，返回 `HTMLAudioElement` |
| `script` | JavaScript 脚本，自动注入页面 |

### 扩展指南

#### 创建自定义图形部件

继承 `$$tk_base` 并实现 `render(ctx)` 方法：

```javascript
class MyShape extends $$tk_base {
    render(ctx) {
        this.__draw(ctx, () => {
            // 自定义绘制逻辑
            ctx.beginPath();
            // ... 绘制路径
        }, false);
    }
}
```

#### 创建自定义管理器

继承 `Manager` 并实现 `update(t)` 方法：

```javascript
class MyManager extends Manager {
    constructor(engine) {
        super(engine, "我的管理器");
    }
    update(t) {
        // 每帧更新逻辑
    }
}
```

### 完整使用示例

```javascript
// 创建引擎
const engine = new jGE({
    width: 800,
    height: 600
});

// 创建显示对象
const container = new ShowObj({ x: 400, y: 300 });

// 添加图形
const rect = new $tk_path({
    styleType: "both",
    style: { fillStyle: "#3498db", strokeStylest: "#2c3e50 2" },
    points: [[-50, -50], [50, -50], [50, 50], [-50, 50], -1]
});
container.add(rect);

// 添加文字
const label = new $tk_font({
    text: "Hello jGE!",
    styleType: "fill",
    style: "#ffffff",
    font: "24px Arial",
    pos: [0, -80]
});
container.add(label);

// 添加到引擎
engine.add(container);

// 事件绑定
engine.on("click", (e) => {
    console.log("引擎被点击", e);
});

// 加载资源
engine.ResourceManager.LoadResPackage("game", [
    { type: "image", url: "hero.png", id: "hero" }
]);

// 资源加载完成后自动播放
engine.one("jGE.Resource.Finish", () => {
    console.log("所有资源加载完成！");
});

// 启动引擎（自动进行）
```

---

*文档版本: 1.0 | 对应 jGE.js v4.5.6*
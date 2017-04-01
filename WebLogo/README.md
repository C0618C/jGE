# Web Logo
> Web Logo 是基于:dragon:jGE的一个小程序，关于:dragon:jGE的内容，请到:dragon:jGE页面查看。  
    
#你还记得当年的小海龟么# 或许对很多人来说，成为程序员只是偶然；但我，在多年前认识小海龟的那个下午，就已经注定了。感谢Logo语言，让我在程序员的路上越走越远。

部署地址：<http://www.vmwed.com/sb/weblogo/>  

## 操作指引
1. 在页面底部有指令输入栏，用于输入指令。
1. 输入指令如 `fd 10` 并按回车，屏幕中海龟将执行向前走10步的指令。
1. 指令的参数若为数字，则可以输入算式表达式，如 `rt 360/24` 等价于 `rt 15`。
1. 每次可以同时输入多个指令，不同指令中间用空格隔开；多个指令组合为一个指令组。
1. 可在指令输入栏按上、下方向键，翻查历史指令记录。
1. 使用help指令获取指令列表，用help + 其它指令（如：`help rt`）获取对应指令的说明。

## 指令说明
指令 | 参数 | 中文指令 | 举例 | 意义
----|------|----------|----------|----------
fd  | 步数（数字） | 前进 | fd 10 | 向前走10步
lt  | 步数（数字） | 左转 | lt 90 | 左转90度
rt  | 角度（数字） | 右转 | rt 45 | 右转45度
bk  | 角度（数字） | 后退 | bk 35 | 后退35步
repeat | 次数（数字） | 重复 | repeat 4[ 其它指令组[*] ] | 重复执行其它指令组4次
home| 无 | 回家 | home | 回初始点，绘画内容保留
cs | 无 | 清屏 | cs | 擦除屏幕所有内容并回归初始点
clean | 无 | —— | clean | 擦除屏幕所有内容，位置角度不变
pu | 无 | 抬笔 | pu | 把笔提起， 不留痕迹
pd | 无 | 落笔 | pd | 把笔放下， 会留痕迹
setpc | 无 | 笔色 | setpc 10 | 设置笔迹颜色，支持颜色编号和颜色数组[#颜色代码]
setbg | 无 | 背景 | setbg [45 55 100] | 设置背景颜色，支持颜色编号和颜色数组[#颜色代码]
setw | 无 | 笔粗 | setw 1 | 将笔粗设为1像素

  
[*]: # "多个指令组合一起，中间用空格隔开。如：fd 100 rt 90"
[#颜色代码]: #颜色代码 "详情参考 颜色代码 一节。"


## 代码举例
描述 | 代码
--|--
雨伞 | rp 180[rt 1 fd 60*pi/180] rt 90 pu fd 120 rt 90 pd rp 3[rp 180[rt 1 fd 20*pi/180] rt 180] pu fd 68 rt 90 bk 60 rt 90 pd fd 8 pu fd 40 pd fd 80 rp 180[rt 1 fd 9*pi/180] 
蒲公英 | repeat 24[fd 40 lt 45 fd 15 bk 15 rt 90 fd 15 bk 15  lt 45 bk 40 rt 360/24] bk 200
蒲公英 | 重复 24[前进 40 左转 45 前进 15 后退 15 右转 90 前进 15 后退 15  左转 45 后退 40 右转 360/24] 后退 200
五角星(定义过程) | to lwjx :b rt 18 repeat 5[fd :b rt 144 fd :b rt 54 fd :b*1.9 bk :b*1.9 lt 126] end lwjx 150
气球 | lt 10 repeat 2[fd 70 rt 90 repeat 360[fd 0.5 lt 1]home rt 10] 
花纹 | repeat 15 [ lt 360/15 fd 80 repeat 20 [ fd 20 lt 45 fd 10 bk 10 rt 90 fd 10 bk 10 lt 45 bk 20 rt 360/20 ] bk 80 ]
直线圆 | rp 45 [ fd 300 rt 128 ]
花朵 | rp 6[lt 45 rp 4[rp 9[fd 5 rt 10] rp 9[fd 5 lt 10] rt 90]rt 105]
矩形纹 | rp 8[fd 30 lt 45 rp 4 [fd 25 rt 90] rt 45 fd 10 lt 45 rp 4 [fd 50 rt 90] rt 45 bk 40 rt 360/8]


## 颜色代码
`setpc` 和 `setbg` 需要用到颜色代码（0-15），代码与颜色对照如下表：
	 0  black	 1  blue	 2  green	 3  cyan
	 4  red		 5  magenta	 6  yellow	 7 white
	 8  brown	 9  tan		10  forest	11  aqua
	12  salmon	13  purple	14  orange	15  grey

## TODO List
* 支持指令 setw、~~setbg~~、setpc、ht、st、~~ct、clean~~、draw
* 支持指令 wait、random
* 支持多行录入、行尾;注释
* ~~根据浏览器语言自动本地化~~
* ~~help指令~~
* 换成海龟

## 版本记录
* v2.0.0 α　　2017-03-31  
    调整解释器，为‘多线程’画图作准备
* v1.7.0　　2017-03-31  
    新增clean、ct
* v1.6.0　　2017-03-30  
    新增setbg
* v1.5.0　　2017-03-28  
    重构国际化部分，支持根据浏览器语言选择显示语言。
* v1.4.0　　2017-03-28  
    支持To ... END方式自定义过程；修复复杂算术表达式分词失败问题；
* v1.3.0　　2017-03-27  
    加入pu pd指令；
* v1.2.0　　2017-03-26  
    优化内部指令描述；增加home，cs指令支持；记录历史指令；
* v1.1.0　　2017-03-25  
    加入中文指令支持。
* v1.0.0　　2017-03-25  
    支持5个基础的画图指令。

# License
You may use the jGE (or Steering Behaviors or Web Logo) under the MIT license. See LICENSE.

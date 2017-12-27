# jGE  
[![Version](https://img.shields.io/github/tag/c0618c/jGE.svg)](https://github.com/c0618c/jGE)
[![License:MIT](https://img.shields.io/dub/l/vibe-d.svg)](https://raw.githubusercontent.com/c0618c/jGE/master/LICENSE)

## 项目概况
这是写着玩的一个项目。除了要完成开发目标外，还有希望通过具体的项目体验Git或GitHub的文化，以及体验前端发展的前沿。所以要是在操作记录或代码里发现些莫名其妙的地方，请不要见怪。  

## 什么是jGE，jGE能做些什么
设计jGE的初衷是能方便或轻量的使用Canvas做点游戏或动画，和方便做些相关的测试研究。当然跟Egret之类的是无法比拟的了。但方便的话，至少在我熟练使用Egret之前都比不上自己开发的吧:)。目的是为了能提升自己的开发能力，所以这只是一个练习。  
理论上能完成绝大多数的2D游戏制作，能做矢量动画，视频播放器（受限于html5的视频播放功能），音乐播放器等。配合[nwjs](https://nwjs.io/)还能打包成与Web端一致的桌面应用。

## jGE将要做什么  
~~大概会向[LÖVE](http://love2d.org/wiki/Main_Page)靠拢，然后再加点自己喜欢的特性。就目前来说，现在谈这些为之过早了。~~  
我会将jGE作为一个独立的项目继续开发及维护下去。并以这个框架为基础做各种有趣的玩意，以便验证功能，改进设计。  
最终目标是能做成一个完全通过json配置驱动的游戏/动画引擎。通过配套的UI工具能快速、傻瓜的完成各种动画功能（游戏逻辑得写代码，或者写伪码。再翻译成脚本，这个估计免不了）。


## 关于 Steering Behaviors
最初接触 Steering Behaviors 是在五年前(约2012)，读《游戏人工智能编程 案例精粹》时。书中在第三章仅是简单的介绍了下。幸好随书附带了群聚、聚集效应模拟的演示程序，正是这些程序的运行效果给了我很大的震撼。自此一直希望有朝一日能通过自己的方法将这一现象演绎出来。  

这就是本项目的开始。目前 Streeing Behaviors 已演变为基于jGE的一个具体案例。  
  
本来打算趁过年假期(2017)，一口气把第三章的内容全做出来。但实际是抽不出多少时间QAQ 要开始上班了，所以托管到Git。  
同样也部署到阿里，[在这里](http://www.vmwed.com/sb/)可以看到最新的成果。  
  
  
## How To Use - 如何使用
本节将介绍如何部署开发测试环境。  

### 环境要求
下列软件请自行安装部署
* nodejs v7或以上
* npm

### 部署
Windows系统可以执行`makefile.bat`进行快速部署（推荐）。  
或者通过以下步骤自行部署。

在终端执行下列代码  

  设置git忽略提交的文件
```
(
    echo node_modules/
    echo package-lock.json
    echo .gitignore
) >> .gitignore
```
  安装依赖的包
```
npm install gulp  gulp-concat  gulp-uglify  uglify-es  del  opn
```
  生成发布版
```
gulp
```

### 开发&测试
源码在src文件夹内，修改后执行`gulp`输出文件，在编辑器打开index.html或其它入口网页，按F5即可运行服务器查看效果。


# 下一步目标  
* 完成资源加载、管理模块
* 硬件加速（性能优化）
* 加入像素级的碰撞检测（开发及性能测试） 
* 接驳Box2D  
* 完成整套的场景调度方案  



# License
You may use the jGE under the MIT license. See LICENSE.
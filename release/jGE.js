const π = Math.PI;
const π2 = 2*π;
const π_hf = 0.5*π; //½π

//获取-1~1之间随机数
function RandomClamped(){
    let r1 = Math.floor(Math.random()*100)%2;
    let r2 = Math.random();

    return (r1==1?-1:1)*r2;
}

//获取event中的
function GetEventPosition(event) {
    var x, y;
    if (event.type.indexOf("touch") != -1) {
        try {
            var touch = event.changedTouches[0];
            y = Math.floor( touch.pageY);
            x = Math.floor(touch.pageX);
        } catch (e) {
            console.error(event, e);
        }
    } else {
        if (event.offsetX || event.offsetX == 0) {
            x = event.offsetX;
            y = event.offsetY;
        } else {
            console.error("获取鼠标坐标失败！");
        }
    }
    return new Vector2D(x, y);
}

class Vector2D {
    constructor(...args) {
        //args.length == 1?({x:this.x = 0,y:this.y=0} = args[0]):([this.x = 0,this.y=0]=args);
        //NOTE:Fixed for Edge
        let a, b;
        args.length == 1 ? ({ x: a = 0, y: b = 0 } = args[0]) : ([a = 0, b = 0] = args);

        this.speed = 0;
        this.va = 0;        //speed angle
        this._x = 0;
        this._y = 0;

        this.x = a;
        this.y = b;
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }

    set x(x) {
        this._x = x;
        this.speed = this.Length();
        this.va = Math.atan2(this.y, this.x);
    }

    set y(y) {
        this._y = y;
        this.speed = this.Length();
        this.va = Math.atan2(this.y, this.x);
    }

    //用速度，方向的角度描述向量
    Velocity(speed, angle) {
        this._x = speed * Math.cos(angle);
        this._y = speed * Math.sin(angle);
        this.speed = speed;
        this.va = angle % π2;
    }

    Copy(v2) { this.x = v2.x, this.y = v2.y; }
    Cloen() { return new Vector2D(this) }

    Zero() { };
    isZero() { return this.x === 0 && this.y === 0; };

    //模长 |v|
    Length() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    LengthSq() { return this.x * this.x + this.y * this.y; }

    //归一化 大小不变的单位矢量 v/|v|
    Normalize() {
        var IvI = this.Length();
        if (IvI == 0) return new Vector2D(0, 0);
        return new Vector2D(this.x / IvI, this.y / IvI);
    };

    //点乘 u·v = uxvx+uyvy
    Dot(u) { return this.x * u.x + this.y * u.y; };

    //方向 适用于y轴朝下x朝右的坐标
    /* 如果v2 在当前矢量的顺时针方向 返回正值
     * 如果v2 在当前矢量的逆时针方向 返回负值
    */
    Sign(v2) {
        //TODO:未完成
    };

    //取得当前矢量的正交矢量
    Perp() {
        //TODO:未完成
    };

    //调整x和y使矢量的长度不会超过最大值
    Truncate(max) {
        //TODO:未完成
    };

    //返回v与v2之间的距离
    Distance(v2) {
        return Math.sqrt(this.DistanceSq(v2));
    };
    DistanceSq(v2) {
        return Math.pow(this.x - v2.x, 2) + Math.pow(this.y - v2.y, 2);
    };

    //返回v的相反矢量
    GetReverse() {
        //TODO:未完成
    };

    //向量加
    AddIn(v2) { this.x += v2.x; this.y += v2.y; return this; }
    //向量减
    MinusIn(v2) { this.x -= v2.x; this.y -= v2.y; return this; }
    //向量乘
    MultiplyIn(a) { this.x *= a; this.y *= a; return this; }

    //加
    Add(v2) { return new Vector2D(this.x + v2.x, this.y + v2.y); }
    //减 v-v2=（X1-X2，Y1-Y2）
    Minus(v2) { return new Vector2D(this.x - v2.x, this.y - v2.y); }
    //乘
    Multiply(a) { return new Vector2D(this.x * a, this.y * a); }

    //旋转角度 x*cosA-y*sinA  x*sinA+y*cosA
    Turn(A) { return new Vector2D(this.x * Math.cos(A) - this.y * Math.sin(A), this.x * Math.sin(A) + this.y * Math.cos(A)); }

    //相等
    Equal(v2) { return this.x == v2.x && this.y == v2.y; }


    *[Symbol.iterator]() { yield this.x; yield this.y; }
}

/*** 渲染对象类 ***/
class ShowObj extends Vector2D{
    constructor({x=0,y=0,angle = 0,obj=null}={}){
        super({x:x,y:y});
        let ObjManager = Symbol('ObjManager');

        let Objects = this.Objects = {        //负责处理的对象
            rObj: [],//渲染队列
            uObj: [],//更新队列
            items: new WeakSet()//对象管理
        };
        this.isDel = false;
        this.angle = angle;//朝向角度 (π -0.5π 0 0.5π)

        this.visible = true;


        //对象管理器
        this[ObjManager] ={
            add:function (obj) {
                if(!Objects.items.has(obj)){
                    obj.isDel = false;
                    Objects.items.add(obj);
                    Objects.uObj.push(obj);
                    if(obj.render != undefined){
                        if(obj.index == undefined) obj.index = 1;
                        if(!Array.isArray(Objects.rObj[obj.index])) Objects.rObj[obj.index] = [];
                        Objects.rObj[obj.index].push(obj);
                    }
                }
            },
            del:function (obj) {
                if(Objects.items.has(obj)){
                    obj.isDel=true;
                    Objects.items.delete(obj);
                }
            }
        };

        this.add = (...x)=>{this[ObjManager].add.bind(this)(...x);return this;}
        this.del = this[ObjManager].del.bind(this);

        if(obj!=null) obj.forEach(o=>this.add(o));
    }

    update(t,pPos={x:0,y:0},angle=0){
        if(!this.visible) return;
        this.Objects.uObj.forEach((o,i) => {
            if(o.isDel){
                this.Objects.uObj.splice(i,1);
            }else{
                o.update(t,this.Add(pPos),this.angle+angle);
            }
        });

        if(this._updateHandler) this._updateHandler(t,new Vector2D(this),this.angle);

        //清理渲染对象
        this.Objects.rObj.map(ol=>{
            ol.forEach((o,i)=>{if(o.isDel) ol.splice(i,1);});
        });
    }
    render(ctx){
        if(!this.visible) return;
        this.Objects.rObj.map(o=>{
            for(let oo of o){
                if(oo.isDel){continue;}
                oo.render(ctx);
            }
        });
    }
    * [Symbol.iterator](){
        for(let i = 0;i<this.Objects.uObj.length;i++){
            yield this.Objects.uObj[i];
        }
    }

    set updateHandler(h){if(h) this._updateHandler = h.bind(this);}
}

class $$tk_base{
    constructor({styleType=null,style=null,pos=new Vector2D(),update=null}={}){
        this.fillStyle = null;
        this.strokeStyle = null;
        this.isAutoEnd = false;
        this.angle = 0;
        this.parentAngle = 0;
        this.styleType = styleType;
        this.alpha = 1;
        this.setStyle(style);
        
        this.pos = new Vector2D(...pos);
        this.centerPoint = new Vector2D();  //部件的偏移中心
        //this.cPos = new Vector2D();//DEBUG:测试用 父级所在位置 旋转中心点

        this.updateHandler = update;

        this.isDel = false;
    }
    //时间，所属元素位置，所属元素角度
    update(t,pPos,angle){
       if(this._updateHandler) this._updateHandler(t,pPos,angle);
       this.parentAngle = angle;
       //this.centerPoint=pPos.Add(this.pos.Turn(angle));
    }
    render(ctx){;}
    setStyle(style){
        let sSet = "",fS="";
        switch(this.styleType){
            case "fill":    this.fillStyle = style; break;
            case "stroke": sSet = style; break;
            //NOTE:Fixed for Edge
            //case "both": ({fillStyle:this.fillStyle,strokeStylest:sSet} = style);break;
            case "both": ({fillStyle:fS,strokeStylest:sSet} = style);break;
        }
        if(sSet){
            //NOTE:Fixed for Edge
            //[this.strokeStyle,this.lineWidth=1,this.lineCap='bull',this.lineJoin='miter'] = sSet.split(' ');
            let [ss,lw=1,lc='bull',lJ='miter'] = sSet.split(' ');
            this.strokeStyle = ss;
            this.lineWidth=lw;
            this.lineCap = lc;
            this.lineJoin=lJ;
            this.fillStyle = fS;           
        }
    }
    __draw(ctx,bef_d,aft_d){
        if(this.strokeStyle && this.lineWidth == 0) return;
        ctx.save();
        if(bef_d) bef_d(ctx);
        ctx.globalAlpha = this.alpha;
        if(this.fillStyle){
            ctx.fillStyle = this.fillStyle;
            ctx.fill();
        }
        if(this.strokeStyle){
            ctx.strokeStyle = this.strokeStyle;
            ctx.lineWidth = this.lineWidth*1;
            ctx.lineCap = this.lineCap;
            ctx.lineJoin = this.lineJoin;
            if(this.isAutoEnd)ctx.closePath();
            ctx.stroke();
        }
        if(aft_d) aft_d(ctx);
        ctx.restore();
    }

    set updateHandler(h){if(h) this._updateHandler = h.bind(this);}

    // ____debug_show_cp(ctx){
    //     //DEBUG: 测试用代码
    //     ctx.beginPath();
    //     ctx.moveTo(this.cPos.x,this.cPos.y);
    //     ctx.arc(this.cPos.x,this.cPos.y,2,0,2*π);
    //     ctx.fillStyle='red';
    //     ctx.fill();
    // }
}

//一个由点和线渲染的部件
class $tk_path extends $$tk_base{
    constructor({styleType="stroke",style="white",points=null,pos=[0,0],update=null}={}){
        if(!points || points.length<=0) return null;
        super({styleType:styleType,style:style,pos:pos,update:update});
        
        this.points = [];
        let lp = null;
        //自动闭合路径
        this.isAutoEnd = (points[points.length-1] == -1)?(lp = points.pop(),true):false;
        points.forEach(p=>{this.points.push(Array.isArray(p)?( new Vector2D(p[0],p[1])):p)});

        if(lp) points.push(lp);
        this.setting = {styleType:styleType,style:style,points:points,pos:pos,update:update};
    }

    update(t,pPos,angle){
        this.centerPoint=pPos.Add(this.pos.Turn(angle));
        super.update(t,pPos,angle);
    }

    render(ctx){
        if(this.points.length == 0 || this.isDel) return;
        
        this.__draw(ctx,()=>this.toPath(ctx),false);
    }

    toPath(ctx){
        ctx.beginPath();
        if(this.dash) ctx.setLineDash(this.dash);
        ctx.translate(this.centerPoint.x,this.centerPoint.y);
        ctx.rotate(this.angle+this.parentAngle);
        ctx.moveTo(this.points[0].x,this.points[0].y);
        for(let s of this.points){
            ctx.lineTo(s.x,s.y);
        }
    }

    clone(){ return new $tk_path(this.setting); }


}

//椭圆
class $tk_ellipse extends $$tk_base{
    constructor({styleType="stroke",style="white 1",points=null,pos=[0,0],update=null,a=0,b=0,r=0}={}){
        super({styleType:styleType,style:style,pos:pos});
        if(r!=0){a = r;b = r;}
        this.a = a;//短轴
        this.b = b;//长轴
        this.r = Math.max(a,b);
        this.ratioX = a / this.r;
        this.ratioY = b / this.r;
        this.isAutoEnd = true;
    }
    update(t,pPos,angle){
        this.centerPoint=pPos.Add(this.pos.Turn(angle));
        super.update(t,pPos,angle);
    }

    render(ctx){
        this.__draw(ctx,()=>this.toPath(ctx),false);
    }

    toPath(ctx){
        ctx.translate(this.centerPoint.x,this.centerPoint.y);
        ctx.rotate(this.angle+this.parentAngle);
        if(this.a!=this.b)ctx.scale(this.ratioX, this.ratioY);
        ctx.beginPath();
        ctx.arc(this.pos.x / this.ratioX, this.pos.y / this.ratioY, this.r, 0, π2, false);
    }
}


//一个由圆弧组成的部件
class $tk_arc extends $$tk_base{
    constructor({styleType="stroke",style="white 1",radius=100
    ,cenPoin=[0,0], startAngle=0, endAngle=π2, anticlockwise = true      //arc
    ,startPoin=[0,0],endPoin=[0,0]                              //arcTo
    }={}){
        super({styleType:styleType,style:style,pos:new Vector2D(...cenPoin)});
        this.r = radius;
        this.sAngle = startAngle;
        this.eAngle = endAngle;
        this.anticlockwise = anticlockwise;
        this.sPoin = startPoin;
        this.ePoin = endPoin;
    }
    update(t,pPos,angle){
        this.centerPoint=pPos.Add(this.pos.Turn(angle));
        super.update(t,pPos,angle);
    }

    render(ctx){
        this.__draw(ctx,()=>{
            ctx.translate(this.centerPoint.x,this.centerPoint.y);
            ctx.rotate(this.angle+this.parentAngle);
            ctx.beginPath();
            if(this.sAngle != this.eAngle) ctx.arc(this.pos.x, this.pos.y, this.r, this.sAngle, this.eAngle, this.anticlockwise);
            else ctx.arcTo(...this.sPoin,...this.ePoin);
        },false);
    }
}

//图像精灵
class $tk_sprite{
    constructor({img={},pos=[0,0],area={width:img.width,height:img.height},sarea=null,update=null}={}){
        if(img == null) return null;
        this.img = img;
        this.barea = Object.freeze({width:area.width,height:area.height}); //原始尺寸
        this.area = area;
        this.sarea = sarea;
        this.pos = new Vector2D(...pos);
        this.dPos = new Vector2D();//画图时的左上角
        this.centerPoint = new Vector2D();//中心点
        this.updateHandler = update;
        this.angle = 0;
        this.parentAngle = 0;
        this.isDel = false;
        this.alpha = 1;
        if(img.width * img.height == 0) console.warn("加载的图像资源宽高异常：",img);
    }
    update(t,pPos,angle){
        this.centerPoint=pPos.Add(this.pos.Turn(angle));
        this.dPos.Copy(this.centerPoint);
        this.dPos.x -= this.area.width/2;
        this.dPos.y -= this.area.height/2;
        this.parentAngle = angle;

        if(this._updateHandler) this._updateHandler(t,pPos,angle);       
    }
    render(ctx){
        ctx.save();
        ctx.translate(this.centerPoint.x,this.centerPoint.y);
        ctx.rotate(this.angle+this.parentAngle);
        ctx.globalAlpha = this.alpha;
        if(this.sarea)   ctx.drawImage(this.img,this.sarea.x,this.sarea.y,this.sarea.width,this.sarea.height,-this.area.width/2,-this.area.height/2,this.area.width,this.area.height);
        else if(this.area) ctx.drawImage(this.img,-this.area.width/2,-this.area.height/2,this.area.width,this.area.height);

        ctx.restore();
    }
    set updateHandler(h){if(h) this._updateHandler = h.bind(this);}
    scale(rate){
        this.area.width = this.barea.width*rate;
        this.area.height = this.barea.height*rate;
    }
}

//字体部件
class $tk_font extends $$tk_base{
    constructor({text="Text Unset",styleType="fill",style="white",font="22px 微软雅黑",angle=0,pos=[0,0],update=null}){
        super({styleType:styleType,style:style,pos:pos,update:update});
        this.font = font;
        this.angle = angle;   //TODO:初始角度
        this.text = text;
    }
    update(t,pPos,angle){
        this.centerPoint=pPos.Add(this.pos.Turn(angle));
        
        super.update(t,pPos,angle);
    }

    render(ctx){
        ctx.beginPath();

        this.__draw(ctx,false,()=>{
            ctx.font = this.font;
            ctx.translate(this.centerPoint.x,this.centerPoint.y);
            ctx.rotate(this.angle+this.parentAngle);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            if(this.fillStyle) ctx.fillText(this.text,0,0);
            if(this.strokeStyle) ctx.strokeText(this.text,0,0);
        });
    }
    text(newText){
        this.text = newText;
    }
    set fontColor(color){
        this.fillStyle = color;
    }
}

//视频部件
class $tk_video extends $tk_sprite{
    constructor(setting){
        setting.img = setting.video;
        super(setting);
        this.video = this.img;
        this.area.width = this.area.width||this.video.videoWidth;
        this.area.height = this.area.height||this.video.videoHeight;
        let area = this.area;
        this.barea = Object.freeze({width:area.width,height:area.height});
    }
    update(t,pPos,angle){
        super.update(t,pPos,angle);
        if(this.area.width == 0) this.area.width = this.video.videoWidth;
        if(this.area.height == 0) this.area.height = this.video.videoHeight;
    }
    pause(isStop){
        if(isStop === false) return this.video.play();
        return this.video.paused?this.video.play():this.video.pause();
    }
    loop(isLoop){
        this.video.loop = isLoop;
    }
    silent(isSilent){
        this.video.volume = isSilent?1:0;
    }

}

//动画部件
class $tk_animation extends $tk_sprite{
    //TODO: 动画的切片播放
    constructor({img=null,pos=[0,0],area={x:0,y:0,width:img.width,height:img.height},sarea=null,fps=8,frame=null,farea={width:0,height:0},update=null}={}){
        if(!frame || farea.height <= 0|| farea.width <= 0){
            console.warn(`动画配置，帧数设置错误，详情请参看配置：${JSON.stringify([...arguments])}
            入参说明：area是当前图片的可视区，当多组sprite在同一个图片时，用于限定当前组的范围。若省略则用全图大小作范围。
            sarea 是最终输出时的裁切区。若省略则输出结果不裁切。 【暂未实现】
            farea 是帧长宽配置，本方法要求动画组的图片每帧尺寸一样。不可省略。
            `);
            return null;
        }
        //切帧
        let frames = [];
        let {x:curX,y:curY} = area;
        let curRow = 0;
        for(let f = 0;f<frame;f++){
            frames.push( {x:curX,y:curY} );
            curX += farea.width;
            if(curX>=area.width){
                curRow++;
                curX = area.x;
                curY += farea.height;
            }
        }

        super({img:img,pos:pos,area:farea,sarea:{x:frames[0].x,y:frames[0].y,width:farea.width,height:farea.height},update:update});
        this.fps = Number(fps);
        this.frame = frame;     //总帧
        this.curFrame = 0;      //当前播放的帧
        this.playTime = 0;      //已经播放过的时间
        this.frames = frames;   //每帧的左上角顶点
        this.timeSpan = 1000/this.fps;
        
        console.dir(this);
        
    }

    update(t,pPos,angle){
        //TODO:丰富动画部件的各种模式（往复播放，播放区裁切）
        this.playTime += t;
        if(this.playTime>=this.timeSpan){
            this.curFrame++;
            if(this.curFrame>=this.frame) this.curFrame = 0;

            this.sarea.x = this.frames[this.curFrame].x;
            this.sarea.y = this.frames[this.curFrame].y;
            this.playTime %= this.timeSpan;
        }
        super.update(t,pPos,angle);
        this.parentAngle = angle;
    }

}
//import ResManager from  'lib/ResManager';

class jGE extends ShowObj{
    //设置参数
    SetConfig(cfg) {
        this.setting = cfg;
        this.run.width = this.setting.width;
        this.run.height = this.setting.height;
        this.run.bgColor = "black";
        this.run.status = "run";
    };

    //初始化
    Init(cfg) {
        //注册各个模块
        this.add(new EventManager(this));
        this.add(new SceneManager(this));
        this.add(this.ResourceManager = new ResourceManager(this));
        //this.add(new ObjectFactory(this));        

        const run = this.run;
        const setting = this.setting;
        const _jGE = this;
        if(cfg != undefined){
            this.SetConfig(cfg);
        }

        setting.dom = document.createElement("canvas");
        if(!setting.dom.getContext) return null;//浏览器不支持Canvas

        setting.dom.id = setting.id;
        setting.dom.width = setting.width;
        setting.dom.height = setting.height;

        //键盘
        this.keyboards = new Set();
        this.__bind_helper(document.body,["keypress","keydown","keyup"],(e)=>{this.keyboards.forEach(kb=>{ kb.keyHandle(e);})});
        this.__bind_helper(setting.dom,["click","touchstart" in setting.dom?"touchstart":"mousedown",
            "touchmove" in setting.dom?"touchmove":"mousemove","touchend" in setting.dom?"touchend":"mouseup","mousewheel"],(e)=>{
            run.curMousePoint = GetEventPosition(e);
            this.keyboards.forEach(kb=>{ kb.pointHandle(e,run.curMousePoint);})
        });

        //运行时参数
        run.context2D =setting.dom.getContext("2d");

        run.curMousePoint = new Vector2D();
        run.rendertime=0;
        run.curfram = 0;
        run.aFps = 0;//平均FPS
        run.vFps = 0;//接近值
        run.fps_rc_time = 0;
        this.update(16);
        this.render();
    };
    
    //更新
    update(t) {  //t 为上次update结束后到现在为止的时间差
        const _jGE = this;
        if(t == 0) console.log(0);
        const run = this.run;
        
        if(run.status != "run") return;
        run.timemark = new Date();

        this.managers.forEach(m=>m.update(t));

        this.Objects.uObj.forEach((o,i) => {
            if(o.isDel){
                this.Objects.uObj.splice(i,1);
            }else{
                o.update(t,_jGE);
            }
        });
        //清理渲染对象
        this.Objects.rObj.map(ol=>{
            ol.forEach((o,i)=>{if(o.isDel) ol.splice(i,1);});
        });

        requestAnimationFrame(function () {
            let ts = new Date() - run.timemark;
            run.fps = Math.round((run.rendertime - run.curfram) * 100000 / ts) / 100;
            run.curfram = run.rendertime;
            run.aFps+=run.fps;
            run.fps_rc_time++;
            _jGE.update(ts);
        });
    };
    
    //渲染
    render() {
        const run = this.run;
        if(run.status != "run") return;
        //setting.context2D.setTransform(1, 0, 0, 1, 0, 0);
        //用背景色清屏
        run.context2D.clearRect(0, 0, run.width, run.height);
        run.context2D.fillStyle = run.bgColor;
        run.context2D.fillRect(0, 0, run.width, run.height);

        //主线渲染工作
        this.Objects.rObj.map(o=>{
            for(let oo of o){
                if(oo.isDel){continue;}
                oo.render(run.context2D);
            }
        });


        run.rendertime++;
        const _jGE = this;
        requestAnimationFrame(function () {
            _jGE.render();
        });
    }

    _add(obj){
        switch(obj.Role){
            case "Manager":
                this.managers.add(obj);
                break;
            case "Keyboard":
                this.super_add(obj.VirtualKeyboard);
                this.keyboards.add(obj);
                break;
            default:
                this.super_add(obj);
                break;
        }
    }

    clean(){
        this.Objects.rObj=[];
        this.Objects.uObj=[];
    }

    //取得画布DOM对象
    GetDom() {return this.setting.dom;};

    //暂停/恢复
    Pause() {  this.run.status = this.run.status == "run" ? "pause":"run";  if(this.run.status == "run"){this.update(16);this.render();}};

    //取得边界
    GetArea(){return {width:this.setting.dom.width,height:this.setting.dom.height};}

    //取得设置
    GetSetting(){return this.setting};

    //判断是否某点在某路径内
    IsInIt(point,path){
        const ctx = this.run.context2D;
        ctx.save();
        path.toPath(ctx);
        ctx.closePath();
        let rsl = ctx.isPointInPath(point.x,point.y);
        ctx.restore();
        return rsl;
    };

    //开通消息模块
    InitMessage(model){
        model.on = this.on.bind(this);
        model.one = this.one.bind(this);
        model.broadcast = this.broadcast.bind(this);
    }

    //提供鼠标事件绑定接口
    OnMouse(action,handler,target){
        this.setting.dom.addEventListener(action,target?handler.bind(target):handler);
    }

    set backgroundColor(color){this.run.bgColor = color;}

    __bind_helper(dom,action,handler){
        action.forEach(a=>dom.addEventListener(a,handler));
    }

    //构造函数
    constructor(){
        super();
        this.version = [4,5,6];//大版本不兼容，中版本加功能，小版本修bug
        this.setting = {};
        const run = this.run = {};//配置了运行时的变量、参数等
        this.temp = {};

        this.managers = new Set();
        this.super_add = this.add;
        this.add = this._add;


        //进行初始化
        let tempCfg = {};
        if(arguments.length > 0){
            if(typeof (arguments[0]) === typeof ({})){
                tempCfg = arguments[0];
            }
        }
        var baseCfg = new GetConfig();
        for(let c in tempCfg){
            baseCfg[c]=tempCfg[c];
        }
        this.SetConfig(baseCfg);

        //注册对外接口
        //事件处理
        this.on=()=>{};
        this.one=()=>{};
        this.broadcast=()=>{};

        //对象管理 根据ID取得资源对象
        this.get = ()=>{};

        this.Init();
    }
}


class Manager{
    constructor(_jGE,name="默认管理器"){
        this._jGE = _jGE;
        if(_jGE.run.iDBug){
            console.log(`[%c报告%c] ${name}已启动。🐠🐠🐠🐠🐠。`,"color:green","color:black");//DEBUG:进度报告
        }
        this.Role = "Manager";
    }
    update(t){

    }
}
/*
    事件处理逻辑：
        事件可以通过jGE对象的on/one/off方法绑定或解绑，各模块通过broadcast事件名称触发事件
        事件响应期为一个update处理周期，每次update结束后自动清空所有事件。
*/
class EventManager extends Manager {
    constructor(_jGE) {
        super(_jGE, "事件管理器");
        this.eventQueue = new Map();        //长期事件处理对象
        this.eventOne = new Map();          //一次性事件对象

        /**
         * 事件处理顺序：broadcast的事件会进入waitEventSet进行等待，在下一个循环片中，waitEventSet事件会进入curEventSet执行。
         * 执行完后——无论有无接收器处理，curEventSet里的事件将会全部清理，接待下一批事件。
         */
        this.waitEventSet = new Set();      //在排队的事件
        this.watiEventObj = new Map();      //排队事件对应的参数
        this.curEventSet = new Set();       //正在等待处理的事件
        this.curEventObj = new Map();       //事件对应的参数

        this._jGE = _jGE;
        _jGE.on = this.on.bind(this);
        _jGE.one = this.one.bind(this);
        _jGE.broadcast = this.broadcast.bind(this);
    }

    //绑定事件
    on(listenEvent, callback) {
        let eq = this.eventQueue.get(listenEvent);
        if (!eq) this.eventQueue.set(listenEvent, eq = []);
        eq.push(callback);
    }
    one(listenEvent, callback) {
        let eq = this.eventOne.get(listenEvent);
        if (!eq) this.eventOne.set(listenEvent, eq = []);
        eq.push(callback);
    }

    //解绑事件
    off(listenEvent) {
        this.eventQueue.set(listenEvent, []);
    }

    broadcast(myEvent, param = undefined) {
        this.waitEventSet.add(myEvent);
        this.watiEventObj.set(myEvent, param);

        // console.info(`发射事件  ${myEvent},事件参数：${JSON.stringify( param)}`)
        // console.log("当前事件配置：",[...this.eventQueue.keys()],[...this.eventOne.keys()])
    }

    //定时
    update(t) {
        if (this.waitEventSet.size > 0) {
            this.curEventSet = this.waitEventSet;
            this.curEventObj = this.watiEventObj;
            this.waitEventSet = new Set();
            this.watiEventObj = new Map();
        }
        let debugLog = () => { };//(eventName,handler)=>{console.log(`捕获事件${eventName},处理者：`),console.trace(handler)};
        //事件轮询
        for (let e of this.eventQueue.keys()) {
            //if(this.curEventSet.size!=0) console.log(e,[...this.curEventSet])
            if (this.curEventSet.has(e)) {
                let fA = this.eventQueue.get(e);
                let event = this.curEventObj.get(e);
                fA.forEach(f => { f(event), debugLog(e, f) });      //DEBUG: 打印事件捕获情况
            }
        }
        for (let e of this.eventOne.keys()) {
            if (this.curEventSet.has(e)) {
                let fA = this.eventOne.get(e);
                let event = this.curEventObj.get(e);
                fA.forEach(f => { f(event), debugLog(e, f) });      //DEBUG: 打印事件捕获情况
                this.eventOne.delete(e);
            }
        }

        //this.curEventSet.forEach(i=>console.debug(`收到事件  ${i}`));//DEBUG:事件监控日志

        this.curEventSet.clear();   //不留存事件
        this.curEventObj.clear();
    }
}
/**
 *      资源管理器
 * 目标：   根据传入配置加载资源
 *          供所有模块通过Id获取对应资源
 *          缓存资源，避免资源重复反复加载
 *          释放资源，在关卡切换等按需释放资源
 *          资源加载进度查询
 */
class ResourceManager extends Manager {
    constructor(_jGE) {
        super(_jGE, "资源管理");
        this.package = new Map();           //资源包，资源的实际引用
        this.processing = new Map();        //进度记录 用于记录当前所有加载情况 数据组层次与package相似
        this.packprocessing = Symbol();     //package 里的特殊记录，用于记录包的下载进度；每一个包都有一个。
        this.Init();
        this.isLoading = false;             //是否在加载数据中
    }

    //
    Init() {

    }

    //取得资源
    GetRes(id, packid = "") {
        let r = undefined;
        try {
            r = this.package.get(packid).get(id);
        } catch (e) {
            console.warn(`尝试获取资源失败(${packid}-${id})，资源尚未加载。信息：${e}`);
            r = null;
        }
        return r;
    }

    //加载资源
    LoadResPackage(packid = "", res = []) {
        if (!this.package.has(packid)) {
            this.package.set(packid, new Map());
            this.package.get(packid).set(this.packprocessing, 0);
            this.processing.set(packid, new Map());
        }

        res.forEach(r => {
            this.LoadRes(packid, r);
        });
        this.isLoading = true;
    }

    LoadRes(packid = "default", { type = "image", url = "", id = "" ,method="POST"} = {}) {
        let ray = this.package.get(packid);
        let rsy = this.processing.get(packid);

        if (this.package.has(packid) && ray.has(id)) {
            console.warn(`发现重复加载资源：${packid}\\${id} 操作已停止。`);
            return;
        }

        this.Ajax({
            url: url, dataType: type,method:method
            , onprogress: (total, loaded) => {
                total = total < loaded ? loaded : total;
                rsy.set(id, { l: loaded, t: total });
            }
        }).then(obj => {
            if(type != "json") obj.id = id;
            ray.set(id, obj);
            ///console.log("finish:", obj);
        }).catch(e => {
            console.error("AjaxEror:", e);
        });
    }

    //释放资源包
    UnLoadResPackage(pakid) {
        if (!this.package.has(pakid)) return false;
        var bag = this.package.get(pakid);

        bag.forEach(element => {
            element = null;
        });

        return this.package.delete(pakid);
    }

    GetPkProcessing(packid) {
        let pg = this.package.get(packid);
        let p = this.processing.get(packid);
        let curPkP =p.get(this.packprocessing);
        if (curPkP == 1) return 1;
        else if(Object.is(curPkP,NaN)) p.set(this.packprocessing, 0);

        let [cur, tol] = [0, 0];
        p.forEach(i => {
            if(i){
                cur += i.l;
                tol += i.t;
            }
        });
        let r = Math.ceil(cur * 1000 / tol) / 1000;
        p.set(this.packprocessing, r);

        if(r == 1) this._jGE.broadcast("jGE.Resource.Package.Finish",packid);
        return r;
    }

    GetProcessing(){
        return this.processing.get(this.packprocessing);
    }

    //更新统计下载进度
    UpdateProcessing(isAvg = true) {
        let p_ing = new Map();
        for (let k of this.package.keys()) {
            p_ing.set(k, this.GetPkProcessing(k));
        };

        if (isAvg) {
            let [l, t] = [0, 0];
            for (let v of p_ing.values()) {
                l += v;
                t++;
            }

            let o = l / t;
            this.processing.set(this.packprocessing,o);
            return o;
        }

        return p_ing;
    }

    update(t, _jGE) {
        if (this.isLoading) {
            let p_s = this.UpdateProcessing();
            if(Math.abs(p_s - 1) < Number.EPSILON * Math.pow(2, 2)) this.isLoading = false;
            console.log(p_s);

            if(!this.isLoading) this._jGE.broadcast("jGE.Resource.Finish");
        }
    }

    Ajax({
        method = "POST", url = ""
        , data = ""            //param for send
        , async = true         //true（异步）或 false（同步）
        , ontimeout = 12000
        , responseType = "text"       // "arraybuffer", "blob", "document",  "text".
        , dataType = "json"          //json、image、video、script...
        , onprogress = () => { }          //自定义处理进程
    } = {}) {
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.open(method, url, async);
            if (["image","video","audio"].includes(dataType)) {
                responseType = "blob";
                if (dataType == "image") dataType = "img";
            }
            if (async) xhr.responseType = responseType;
            xhr.setRequestHeader("Content-type", "application/x-www-four-urlencoded;charset=UTF-8");
            xhr.ontimeout = ontimeout;
            // xhr.onreadystatechange=function(){
            //     if(xhr.readyState==4 && xhr.status==200){

            //     }
            // }

            xhr.onload = function (e) {
                if (this.status == 200 || this.status == 304) {
                    let rsp = null;
                    // console.log(this.response);
                    if (dataType == "json") rsp = JSON.parse(this.response);
                    else {
                        rsp = document.createElement(dataType);
                        if (dataType == "script") {
                            rsp.textContent = this.response;
                            document.body.appendChild(rsp);
                        } else {
                            rsp.src = window.URL.createObjectURL(this.response);
                            rsp.onload = e => window.URL.revokeObjectURL(rsp.src);
                        }
                    }
                    resolve.call(this, rsp);
                }else if(this.status == 404){
                    reject.call(this, this.response);
                }
            };
            xhr.onerror = reject;
            // xhr.upload.onprogress = onuprogress;
            xhr.onprogress = function (e) {
                onprogress.call(this, e.total, e.loaded);
            };

            try {
                xhr.send(data);
            } catch (e) {
                reject.call(this, e);
            }
        });
    }

}
class SceneManager extends Manager{
    constructor(_jGE){
        super(_jGE,"场景调度管理"); 

        // _jGE.one("jGE.Config.Loaded.scene",this.InitScene.bind(this));
        // _jGE.one("jGE.Config.Loaded",this.PlayScene.bind(this));

        this.sceneCfg=new Map();
        this.nextScene = "";            //将要播放的下一场景

        this.Logo();
    }

    InitScene(cfg){     //从配置文件初始化场景设置
        cfg.forEach(cf =>{
            //console.log("AAAAA::"+JSON.stringify( cfg))

            // cf.setting.forEach(c=>{
            //     if(c.default) this.nextScene = c.id;
            //     this.sceneCfg.set(c.id,c);
            // })
        });
        
    }

    PlayScene(){
        // let curSenceCfg = this.sceneCfg.get(this.nextScene);
        // this.nextScene = curSenceCfg.prepare;
        // this._jGE.broadcast("jGE.SceneChange.Start",curSenceCfg.id);

        //console.debug(`切换场景${curSenceCfg.id}`);
    }

    //用于显示Logo的场景
    Logo(){
        let u2 = function(){this.angle=0;};
        console.log("开始Logo展示 🐉 jGE");
        let font = '180px \'微软雅黑\'';
        let bL = 130;
        let pos = new Vector2D(this._jGE.run.width/2,this._jGE.run.height/2);
        let _logo_jGE = new ShowObj(pos.Add({x:180,y:-20}));
        _logo_jGE.add(new $tk_font({text:'jGE',styleType:'fill',style:'#555555',font:font,pos:[4,4]}));
        _logo_jGE.add(new $tk_font({text:'jGE',styleType:'fill',style:'#808080',font:font,pos:[3,3]}));
        _logo_jGE.add(new $tk_font({text:'jGE',styleType:'fill',style:'#aaaaaa',font:font,pos:[2,2]}));
        _logo_jGE.add(new $tk_font({text:'jGE',styleType:'fill',style:'white',font:font,pos:[0,0]}));

        let _logo_jGE_ico = new ShowObj(pos.Add({x:-180,y:0}));
        _logo_jGE_ico.add(new $tk_font({text:'🐉',styleType:'fill',style:'rgba(255,0,0,0.82)',font:'200px serif',pos:[0,-10],update:u2}));
        _logo_jGE_ico.add(new $tk_font({text:'🐉',styleType:'stroke',style:'rgba(255,255,255,0.8) 5',font:'200px serif',pos:[0,-10],update:u2}));        
        _logo_jGE_ico.add(new $tk_path({styleType:'stroke',style:"#808080 20 round round" ,points:[[-bL,-bL],[bL,-bL],[bL,bL],[-bL,bL],-1],pos:[2,2],update:u2}));
        _logo_jGE_ico.add(new $tk_path({styleType:'stroke',style:"rgba(255,255,255,0.9) 20 round round" ,points:[[-bL,-bL],[bL,-bL],[bL,bL],[-bL,bL],-1],pos:[0,0],update:u2}));


        {//DEBUG: 临时，以后将用场景管理处理
            let hasBrocase = false;
            let __jGE = this._jGE;
            let dimissHl = function(t){
                if(this.showtime==undefined) this.showtime = 0;
                this.showtime += t;
                if(this.showtime >= 1500){
                    this.isDel = true;
                    if(!hasBrocase){
                        hasBrocase = true;
                        __jGE.broadcast("jGE.Scene.Logo.End");
                    }
                }
            }

            _logo_jGE.updateHandler = dimissHl;
            _logo_jGE_ico.updateHandler = dimissHl;
        }
        this._jGE.add(_logo_jGE);
        this._jGE.add(_logo_jGE_ico);
    }

}
/**
 * 键盘：按键管理模块
 */
class Keyboard extends Manager{
    constructor(_jGE){
        super(_jGE,"虚拟键盘");
        this.Role = "Keyboard";
        this.isEnable = true;
        
        this.allkey = new Map();                
        this._virtualkeyboard = new ShowObj();

        // const t = this._virtualkeyboard.AddIn.bind(this._virtualkeyboard);
        // const t2 = this._virtualkeyboard.Copy.bind(this._virtualkeyboard);
        // this._virtualkeyboard.AddIn = (...x)=>{t(...x);this.flash();}
        // this._virtualkeyboard.Copy = (...x)=>{t2(...x);this.flash();}

    }

    keyHandle(event){
        if(!this.isEnable) return;
        if(this.allkey.has(event.code)){
            this.allkey.get(event.code).on(event);
        }

    }

    //键盘、触摸接口
    pointHandle(event,pos){
        if(!this.isEnable) return;

        let e = {x:pos.x,y:pos.y,style:"point"};
        switch(event.type){
            case "mousemove": e.type = "over"; break;
            case "mousedown": e.type = "keydown"; break;
            case "mouseup": e.type = "keyup"; break;
            case "click": e.type = "keypress"; break;
            case "dblclick": e.type = "dblclick"; break;
            case "touchstart": e.type = "keydown"; break;
            case "touchmove": e.type = "over"; break;
            case "touchend": e.type = "keyup"; break;
            case "mousewheel": e.type = "scroll";e.delta = event.deltaY; break;
        }

        this.allkey.forEach(k=>k.on(e));
    }
    turnOn(){
        this.isEnable = true;
    }

    turnOff(){
        this.isEnable = false;
    }

    add(key){
        key._jGE = this._jGE;
        this.allkey.set(key.code,key);

        this.VirtualKeyboard.add(key);
    }

    //取得某个按键对象
    get(keyCode){return this.allkey.get(keyCode);}

    //取得整个虚拟键盘的可视化对象
    get VirtualKeyboard(){ return this._virtualkeyboard;}

    // //刷新键盘，为了解决键盘整体移位后，按键第一次触发会在原来位置闪现一下的问题
    // flash(){
    //     this.allkey.forEach(k=>k.flash());
    //     this.VirtualKeyboard.update(0,this._jGE);
    //     this.allkey.forEach(k=>k.reset());
    // }

    //设置键盘整体位置
    SetPos(pos){
        if(pos.x!=undefined && pos.y!=undefined) this.VirtualKeyboard.Copy(pos);
        else if(Array.isArray(pos)) this.VirtualKeyboard.Copy({x:pos[0],y:pos[1]});
    }

}


/**
 * 按键
 */
class Key  extends ShowObj{
    /*
        upObjs 按钮平常态
        downObjs 按钮按下
        hoverObj 按钮被划过、聚焦
        actObj 按钮感应区域
    */
    constructor({key="",code="",handler=null,upObjs=[],downObjs=null,hoverObj=null,actObj=null,x=0,y=0,angle=0}={}){
        super({x:x,y:y,angle:angle});

        this.handler = new Map();
        this.code = code;
        this.KEYSTATUS = {"Normal":Symbol(),"Down":Symbol(),"Hover":Symbol()};
        this.status = this.KEYSTATUS.Down;

        this.btShowObjs = new Map([[this.KEYSTATUS.Normal,upObjs],[this.KEYSTATUS.Down,downObjs],[this.KEYSTATUS.Hover,hoverObj]]);

        this.activeArea = actObj || upObjs[0];
        this._jGE = null;

        if(handler !== null) addEventListener(type,handler);

        this._changeStatus("keyup");
    }

    //按键触发
    on(event){
        //鼠标、触摸操控转换命中判断
        if(event.style == "point"){
            if(!this._IsHit(event)){
                if(this.status == this.KEYSTATUS.Hover) event.type = "out";
                else return;
            }
            event.code = this.code;
        }

        this._changeStatus(event.type,event.style);        

        if(!this.handler.has(event.type)) return false;        
        this.handler.get(event.type).forEach(h => {
            h(event);
        });
    }

    //type 动作类型，已被归类为[keydown,keyup,over,out]
    addEventListener(type,handler){
        if(!this.handler.has(type)) this.handler.set(type,new Set());

        this.handler.get(type).add(handler);
    }

    removeEventListener(type){
        if(this.handler.has(type)){
            this.handler.get(type).clear();
        }
    }

    _changeStatus(type,style){
        if(type == "keypress") return;
        let oldStatus = this.status;
        switch(type){
            //case "keypress":this.status=this.KEYSTATUS.Down; break;
            case "keydown":this.status=this.KEYSTATUS.Down; break;
            case "keyup":this.status= style == "point"?this.KEYSTATUS.Hover : this.KEYSTATUS.Normal;break;
            case "over":this.status = this.KEYSTATUS.Hover;break;
            case "out":this.status = this.KEYSTATUS.Normal;break;
        }

        if(oldStatus != this.status){
            if(this.btShowObjs.get(oldStatus)!=null) this.btShowObjs.get(oldStatus).forEach(o=>{this.del(o);});
            if(this.btShowObjs.get(this.status)!=null) this.btShowObjs.get(this.status).forEach(o=>{this.add(o);});
        }
    }

    // flash(){
    //     this.btShowObjs.forEach(oL=>oL.forEach(o=> this.add(o)));
    // }

    // reset(){
    //     this.btShowObjs.forEach((oL,k)=>{if(k != this.status) oL.forEach(o=> this.del(o))});
    // }

    _IsHit(event){
        return this._jGE.IsInIt(event,this.activeArea);
    }

}

//拖拽控制助手
class DragHelper{
    // constructor(_jGE,setting){
    //     // let w = setting.tape.cell_width*(setting.pitch_names.length-1)
    //     // let h = setting.tape.max_height;
    //     // let pu = new $tk_path({styleType:'stroke',style:"red 1" ,points:[[0,0],[w,0],[w,h],[0,h],-1],pos:[0,0]});
    //     // let pd = new $tk_path({styleType:'both',style:{fillStyle:"red",strokeStylest:"white 2"} ,points:[[0,0],[w,0],[w,h],[0,h],-1],pos:[0,0]});


        
    //     // let k  = new Key({
    //     //     code:"clickDown",
    //     //     upObjs:[pu],downObjs:[pd],x:0,y:0
    //     // });
    //     // DragHelper.InitDrag(k,{
    //     //     startCallback:(e)=>console.log("start!",e)
    //     //     ,moveCallback:(e)=>console.log("move",e)
    //     //     ,endCallback:(e)=>console.log("end",e)
    //     // })
    //     // let kb = new Keyboard(_jGE);
    //     // kb.add(k);        
    //     // kb.SetPos(setting.tape.pos)
    //     // _jGE.add(kb);


    // }


    static InitDrag(key,{startCallback=null,moveCallback=null,endCallback=null,scrollCallback=null}={}){
        key._drag_status = {
            startPos:{x:0,y:0}
            ,isDraging:false
        };

        key.addEventListener("keydown",e=>{
            key._drag_status.startPos = new Vector2D(e);
            key._drag_status.isDraging = true;
            if(startCallback) startCallback.call(key);
        });

        key.addEventListener("over",e=>{
            if(!key._drag_status.isDraging) return;
            if(moveCallback) moveCallback.call(key,key._drag_status.startPos,e);
        });

        key.addEventListener("keyup",e=>{
            if(endCallback) endCallback.call(key,e);
            key._drag_status.isDraging = false;
        });

        key.addEventListener("scroll",e=>{
            if(scrollCallback) scrollCallback.call(key,e.delta);
        });

    }
}

//用于获取基本配置
//TODO: 合并为默认参数 取消本文件
function GetConfig() {
    let config={
        id:"jGE_"+Math.random()*100,dom:null,
        width:1280,height:640,
        fps:30,
        isRoundWorld:true,
        keyHandler:function (event) {}
    };

    return config;
}
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
            "touchmove" in setting.dom?"touchmove":"mousemove","touchend" in setting.dom?"touchend":"mouseup"],(e)=>{
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
        this.version = [4,2,0];//大版本不兼容，中版本加功能，小版本修bug
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
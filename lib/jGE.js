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
        this.add(this.ResManager = new ResManager(this));
        this.add(new ObjectFactory(this));        

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
        if(setting.keyHandler) document.body.addEventListener("keypress", function (e) {
            setting.keyHandler.call(_jGE, e);
        }, false);

        //鼠标监听
        setting.dom.addEventListener("mousemove",function (e) {
            run.curMousePoint = GetEventPosition(e);
            if(setting.mousemoveHandler)setting.mousemoveHandler.forEach(h=>h.call(_jGE,e));
        });

        //运行时参数
        run.context2D =setting.dom.getContext("2d");

        //Debug工具
        run.debug={
            profile:false,
            showFps:true,
            maxTimeSpan:1,
            fixSpeed:0, //固定延时执行的毫秒数
            showMousePos:true,
            showLoadedProcess:true            //显示资源加载进度
        };

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
        if(run.iDBug && t>run.debug.maxTimeSpan) run.debug.maxTimeSpan = t;
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

        if(run.iDBug&&run.debug.fixSpeed !=0){
            setTimeout(function () {
                let ts = 17;//new Date() - run.timemark;
                run.fps = Math.round((run.rendertime - run.curfram) * 100000 / ts) / 100;
                run.curfram = run.rendertime;
                //_jGE.update(ts);
                _jGE.render();
            },run.debug.fixSpeed);
        }else {
            requestAnimationFrame(function () {
                if (run.iDBug && run.debug.profile) console.profile("update");
                let ts = new Date() - run.timemark;
                run.fps = Math.round((run.rendertime - run.curfram) * 100000 / ts) / 100;
                run.curfram = run.rendertime;

                run.aFps+=run.fps;
                run.fps_rc_time++;
                _jGE.update(ts);
                if (run.iDBug && run.debug.profile) console.profileEnd("update");
            });
        }
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

        
        if(run.iDBug) {
            const lh = 16;
            let idx = 1;
            run.context2D.font = lh+"px 宋体";
            run.context2D.fillStyle="white";

            //FPS
            if(run.debug.showFps){
                run.context2D.fillText("FPS:" + run.fps, 0, lh*idx++);
                run.context2D.fillText("aFPS:" + Math.round(run.aFps/run.fps_rc_time*100)/100, 0, lh*idx++);                
            }
            
            //鼠标坐标
            if(run.debug.showMousePos){
                run.context2D.fillText(`+Pos:(${run.curMousePoint.x},${run.curMousePoint.y})`, 0, lh*idx++);
            }

            if(run.debug.showLoadedProcess) run.context2D.fillText(`Loading:${this.ResManager.GetProcessing()}%`, 0, lh*idx++);

            run.context2D.fillText(`keycode:${this.temp.keyCode||0}`, 0, lh*idx++);
        }

        run.rendertime++;
        const _jGE = this;
        if(run.iDBug&&run.debug.fixSpeed !=0){
            setTimeout(function () {
                //_jGE.render();
                _jGE.update(17);
            },run.debug.fixSpeed);
        }else {
            requestAnimationFrame(function () {
                if (run.iDBug && run.debug.profile) console.profile("render");
                _jGE.render();
                if (run.iDBug && run.debug.profile) console.profileEnd("render");
            });
        }
    };

    add(obj){
        if(obj.Role == "Manager"){
            this.managers.add(obj);
        }else{
            this.ObjManager.add(obj);
        }
    }

    clean(){
        this.Objects.rObj.clean();
        this.Objects.uObj.clean();
    }

    //取得画布DOM对象
    GetDom() {return this.setting.dom;};

    //暂停/恢复
    Pause() {  this.run.status = this.run.status == "run" ? "pause":"run";  if(this.run.status == "run"){this.update(16);this.render();}};

    //取得边界
    GetArea(){return {width:this.setting.dom.width,height:this.setting.dom.height};}

    //取得设置
    GetSetting(){return this.setting};

    set backgroundColor(color){this.run.bgColor = color;}

    //测试用
    _debug_show_me_all() {console.log("setting:",this.setting,"\n\nrun:",this.run,"\n\ntemp:",this.temp);return this.run.context2D};
    _debug_show_me_obj(){console.log(this.run.Objects.items)}

    //构造函数
    constructor(){
        super();
        this.version = [1,0,2];//大版本不兼容，中版本加功能，小版本修bug
        this.setting = {};
        const run = this.run = {};//配置了运行时的变量、参数等
        this.temp = {};

        this.managers = new Set();


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

        this.run.iDBug = true;//DEBUG: debug总开关

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
/*export default */ class ResManager{
    constructor(){
        //this.ResObj = new Map();//需加载的资源
        this.LoadingQueue = new Map();
        this.ResHandler=new Map();
        this.XHRRes = new Map();
        this.ResCfg = {};       //所有配置
        this.Init();
        this.ObjectFactory = new ObjectFactory(this);
    }
    //初始化
    Init(){
        //注册资源处理方法
        this.ResHandler.set("default",(cfg,scene)=>{return res =>{}});
        this.ResHandler.set("video",this.__get_finish_video);

        LoadResources({
            url:"./res/packages.cfg",type:"config",
            success:data => this.LoadCfg(data),
            error:e=>console.dir(e)
        });
    }

    //加载配置 根据配置文件【packages.cfg】加载所有配置。
    LoadCfg(cfgs){
        let loadfile = 0;
        for(let cfg in cfgs){
            cfgs[cfg].forEach(c=>{
                ++loadfile;
                this.XHRLoad({url:c.path,type:"config",id:c.path,finish:(e)=>{ c.setting = e; loadfile--;}});
            });            
        }

        this.ResCfg = cfgs;

        //TODO:临时加载资源 放到Update里监听
        let t = setInterval(i=>{if(loadfile==0){clearInterval(t);this.LoadRes();}},100);
    }
    //加载资源
    LoadRes(sence){
        let res = this.ResCfg.reource;
        if(!res||res.length == 0){
             console.error("资源配置文件尚未加载，请检查packages.cfg文件reource节点。");
             return false;
        }
        
        res.forEach(r=>{
            if(sence && r.scene != sence) return;
            r.setting.forEach(i=>{
                if(!i.url||!i.type) return;
                let finishHandler = this.ResHandler.get(this.ResHandler.has(i.type)?i.type:"default");
                let setting = {id:`@${r.scene}#${i.id}`,type:i.type,url:i.url,success:null}
                setting.finish = finishHandler(i,r.scene);
                this.XHRLoad(setting);
            });
        });

        return true;
    }
    XHRLoad(setting){
        if(this.XHRRes.has(setting.url)){
            console.info("资源加载优化：发现重复加载资源，将调取本地缓存。");
            let res = this.XHRRes.get(setting.url);
            setting.finish(res);
        }else{
            setting.onprogress = (total,loaded)=>{total=total<loaded?loaded:total;this.LoadingQueue.set(setting.id,{l:loaded,t:total});};
            setting.success = res =>{
                this.XHRRes.set(setting.url,res);
                setting.finish(res);
            }
            LoadResources(setting);
        }
    }
    //取得进度
    GetProcessing(){
        let [cL,cT]=[0,0];
        this.LoadingQueue.forEach(i=>{cL+=i.l;cT+=i.t;});
        cT = cT || 1;
        return Number((cL/cT*100).toFixed(2));
    }
    //取消
    Abort(){

    }

    update(t,_jGE){
        this.ObjectFactory.update(t,_jGE);

        let proc = Number( this.GetProcessing());
        //DEBUG:
        if(proc < 100){
            console.info(`资源加载进度：${proc}%`)
        }

    }
    render(ctx){

    }

    //载入资源
    __get_finish_video(cfg,scene){
        return video=>{
            let v_cfg = {video:video};
            if(cfg.loop) video.loop = true;
            if(!Number.isNaN( Number.parseFloat(cfg.volume))) video.volume = Number.parseFloat(cfg.volume);
        }
    }
}

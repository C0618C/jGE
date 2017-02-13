/*export default */ class ResManager{
    constructor(){
        this.ResCfg = new Map();//key:secne,value:[cfg_obj]
        this.ResObj = new Map();
        this.LoadingQueue = new Map();
        this.OM = new Map();
        let _Init = this.Init;
        const rmg = this;

        LoadResources({
            url:"./res/packages.json",
            success:data => {_Init.call(rmg,data);}
        })
    }
    //初始化
    Init(data){
        data.forEach(c=>{
            this.LoadCfg(c);

            //c.scene.forEach(s => {
                // if(!this.ResCfg.has(s)) this.ResCfg.set(s,[]);
                // this.ResCfg.get(s).push(c);
            //});
        });
    }
    //加载配置
    LoadCfg(cfg){
        //TODO:根据Package设置加载每一个配置文件

        let pHdl = (total,loaded)=>{this.LoadingQueue.set(cfg.id,{l:loaded,t:total});};
        LoadResources({url:cfg.path,onprogress:pHdl,success:(e)=>{ console.log(e)}});

    }
    //加载资源
    LoadRes(scene){

    }
    //取得进度
    GetProcessing(){
        let [cL,cT]=[0,0];
        this.LoadingQueue.forEach(i=>{cL+=i.l;cT+=i.t;});
        return Math.round(cL/cT*10000)/100;
    }
    //取消
    Abort(){

    }
}
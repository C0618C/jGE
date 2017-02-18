/*export default */ class ResManager{
    constructor(){
        this.ResCfg = new Map();//key:secne,value:[cfg_obj]
        this.ResObj = new Map();
        this.LoadingQueue = new Map();
        this.OM = new Map();
        let _Init = this.Init;
        const rmg = this;

        LoadResources({
            url:"./res/packages.cfg",type:"config",
            success:data => _Init.call(rmg,data),
            error:e=>console.dir(e)
        });
    }
    //初始化
    Init(data){
        console.log(data);
        // data.forEach(c=>{
        //     this.LoadCfg(c);
        //     //c.scene.forEach(s => {
        //         // if(!this.ResCfg.has(s)) this.ResCfg.set(s,[]);
        //         // this.ResCfg.get(s).push(c);
        //     //});
        // });
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

/*
* 加载矢量图配置
* */
function  __load_vector({type=null,styleType=null,fill=null,points=null}) {
    
}

/*
 * 加载矢量图配置—给定路径的矢量图
 * */
function __load_vector__path({type=null,styleType=null,fill=null,points=null}) {
    let t_path = new ShowObj();

}

/*
 * 加载位图资源
 * */
function  __load_sprite({}) {

}

/*
 * 加载视频资源
 * */
function  __load_text({}) {

}

/*
 * 加载声音资源
 * */
function  __load_voice({}) {

}

/*
 * 加载视频资源
 * */
function  __load_move({}) {

}


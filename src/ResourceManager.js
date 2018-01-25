/**
 *      资源管理器
 * 目标：   根据传入配置加载资源
 *          供所有模块通过Id获取对应资源
 *          缓存资源，避免资源重复反复加载
 *          释放资源，在关卡切换等按需释放资源
 *          资源加载进度查询
 */
class ResourceManager  { //extends Manager
    constructor(_jGE) {
        //super(_jGE, "资源管理");

        this.package = new Map();           //资源包，资源的实际引用
        this.resources = new WeakMap();     //所有资源的引用
    }

    //初始化
    Init() {

    }

    //取得资源
    GetRes(id, pakid = "") {
        return this.resources.get(this.ResourceId(packid, id));
    }

    //加载资源
    LoadResPackage({ packid = "", res = [] } = {}) {

    }

    LoadRes(packid = "default", { type = "image", url = "", id = "" } = {}) {
        if(this.resources.has(this.ResourceId(packid,id))){
            console.warn(`发现重复加载资源：${packid}\\${id} 操作已停止。`);
            return;
        }
        
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

    //统一设置资源规则
    ResourceId(packid, id) { 
        return Symbol.for(packid == "" ? id : `${packid}.${id}`);
    }
    
    Ajax({
        method="POST",url=""
        ,data=""
        ,async=true         //true（异步）或 false（同步）
        ,ontimeout = 120
        ,responseType ="text"       // "arraybuffer", "blob", "document",  "text".
        ,dataType = "json"
        ,onprogress=()=>{}          //自定义处理进程
    }={}){
        return new Promise(function(resolve,reject){
            let xhr = new XMLHttpRequest();
            xhr.open(method,url,async);
            if(dataType == "image" ||dataType == "video"){
                responseType = "blob";
            }
            if(async) xhr.responseType = responseType;
            xhr.setRequestHeader("Content-type","application/x-www-four-urlencoded;charset=UTF-8");
            xhr.ontimeout = ontimeout;
            // xhr.onreadystatechange=function(){
            //     if(xhr.readyState==4 && xhr.status==200){

            //     }
            // }

            xhr.onload = function(e) {
                if(this.status == 200||this.status == 304){
                    let rsp = this.response;
                    // console.log(this.response);
                    if(!async && dataType == "json") rsp = JSON.parse(rsp);
                    else if(dataType == "image"){
                        rsp = new Image();
                        rsp.onload = e => window.URL.revokeObjectURL(rsp.src);
                        rsp.src = window.URL.createObjectURL(this.response);
                    }else if(dataType == "video"){
                        rsp = document.createElement("video");
                        rsp.onload = e => window.URL.revokeObjectURL(rsp.src);
                        rsp.src = window.URL.createObjectURL(this.response);
                    }else if(dataType == "script"){
                        let sblock = document.createElement("script");
                        sblock.textContent = rsp;
                        document.body.appendChild(sblock);
                        //return;
                    }
                    resolve.call(this,rsp);
                }
            };
            xhr.onerror = reject;
            // xhr.upload.onprogress = onuprogress;
            xhr.onprogress =function (e) {
                onprogress.call(this,e.total,e.loaded);
            };
        
            try{
                xhr.send(data);
            }catch (e){
                reject.call(this,e);
            }
        });
    }

}
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
        this.Init();
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
            this.processing.set(packid,new Map());
        }

        res.forEach(r => {
            this.LoadRes(packid, r);
        });
    }

    LoadRes(packid = "default", { type = "image", url = "", id = "" } = {}) {
        let ray = this.package.get(packid);
        let rsy = this.processing.get(packid);

        if (this.package.has(packid) && ray.has(id)) {
            console.warn(`发现重复加载资源：${packid}\\${id} 操作已停止。`);
            return;
        }

        this.Ajax({ url: url, dataType: type
            ,onprogress = (total,loaded)=>{
                total=total<loaded?loaded:total;
                this.rsy.set(id,{l:loaded,t:total});
            }
         }).then(obj => {
            obj.id = id;
            ray.set(id, obj);
            console.log("finish:", obj);
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

    GetPkProcessing(packid){
        let p = this.processing.get(packid);
        let [cur,tol] = [0,0];
        p.forEach(i=>{
            cur += i.l;
            tol += i.t;
        });
        return cur / tol;
    }

    //取得进度
    GetProcessing(){
        let p_ing = new Map();
        for (let k of this.processing.keys()) {
            this.p_ing.set(k,GetPkProcessing(k));            
        };

        return p_ing;
    }

    update(t,_jGE){
        // let proc = Number( this.GetProcessing());
        // //DEBUG:在控台显示资源加载进度
        // if(proc < 100 && proc > 0){
        //     console.debug(`资源加载进度：${proc}%`)
        // }

        // //判断是否所有配置文件远程加载完毕，并发射相应的事件消息
        // if(this.ResCfg.status === false){
        //     let ok = true;
        //     let eventHead = "jGE.Config.Loaded";
        //     for(let k of Object.keys(this.ResCfg)){
        //         if(k == "status") continue;
        //         if(Array.isArray(this.ResCfg[k])&&this.ResCfg[k].broadcasted !== true){
        //             this.ResCfg[k].forEach(i=>{ ok = (ok && (i.setting != undefined)) });

        //             if(ok){
        //                 this._jGE.broadcast(`${eventHead}.${k}`, this.ResCfg[k]);
        //                 this.ResCfg[k].broadcasted = true;
        //             }
        //         }
        //     }

        //     if(ok){
        //         this.ResCfg.status = true;
        //         this._jGE.broadcast(eventHead, this.ResCfg);
        //     }
        // }
        

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
            if (dataType == "image" || dataType == "video") {
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
                    if (!async && dataType == "json") rsp = JSON.parse(this.response);
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
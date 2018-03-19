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
            obj.id = id;
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
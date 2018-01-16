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




}
//工厂对象，用于管理、组装、销毁所有部件
/*
    统一id规则：@场景id&类型id#素材或对象id /^@([^@&#].*?)&([^@&#].*?)#([^@&#].*)$/
*/
class ObjectFactory{
    constructor(_jGE){
        console.log("[%c报告%c] 对象管理器已启动。","color:green","color:black");//DEBUG:进度报告
        this.objectCfg = new Map();             //所有的可创建对象的配置仓
        this.objectHub = new Map();             //所有由工厂生成的对象仓库

        this._jGE = _jGE;

        _jGE.one("jGE.Resource.Loaded.object",objCfg=>{
            let createrHandler = new Map([["path",$tk_path],["sprite",$tk_sprite],["text",$tk_font],["video",$tk_video],["anima",$tk_animation]]);
            objCfg.forEach(c=>{
                c.setting.forEach(cs=>{
                    if(this.objectCfg.has(cs.type)){
                        console.error(`对象配置文件出错，对象类型[${cs.type}]发现重复。\n配置:${JSON.stringify(cs)}`);
                        return;
                    }
                    if(!cs.pos) cs.pos=[0,0];
                    this.__init_cfg(cs,createrHandler);
                    this.objectCfg.set(cs.type,cs);
                });
            });
        });


    }

    
    //初步配置、检查各可视部件设置
    __init_cfg(c,handlerMap){
        //NOTE:这段将影响对象类 items属性的 配置文件结构
        if(!c.items){
            console.error(`对象配置文件出错：items节点缺失。\n配置：${JSON.stringify(c)}`);
            return;
        }

        c.items.forEach(i=>{
            i.handler = handlerMap.get(i.type);
            if(!i.handler){
                console.error(`对象配置文件出错：可视部件类型错误${i.type}。\n配置：${JSON.stringify(c)}`);
                return;
            }
            //TODO:预处理配置为可以直接调用的程度
            let tSetting = {};
            for(let n in i){
                if(typeof i[n] == typeof(()=>{})) continue;
                switch(n){          //TODO:完成其它配置文件预处理并进行测试！！！
                    case "points":
                        tSetting[n]=[];
                        i[n].forEach(ni=>tSetting[n].push(new Vector2D(...ni)));
                        break;
                    case "res":
                        if(/^(?:sprite|(video)|anima)$/.test(i.type)){
                            let res = null;
                            if(RegExp.$1 == "video") tSetting.video = res;
                            else tSetting.img = res;
                        }
                        break;
                    default:
                        tSetting[n]=i[n];
                        break;
                }
            };
            i.setting = tSetting;
        });
    }

    //type格式 @场景id&类型id
    create(type){
        //校验传入的是id或type 并生成合法的命名 //NOTE:这段影响代码中的id命名方式
        let idCheck = /^@([^@&#].*?)&([^@&#].*?)#([^@&#].*)$/ig.test(type);
        let [senceId,typeId,objId]=[RegExp.$1,RegExp.$2,RegExp.$3];
        if(!idCheck){
            if(/^@([^@&#].*?)&([^@&#].*)/.test(type)){
                [senceId,typeId]=[RegExp.$1,RegExp.$2];
                objId =typeId.substr(0,2)+(Math.random()*100000).toFixed(0);
            }else{
                console.error(`创建对象失败，对象类型配置出错${type}`);
                return null;
            }
        }

        //NOTE:这段将影响对象类配置文件结构
        let cfg = this.objectCfg.get(typeId);
        if(!cfg || !cfg.items){
            console.error(`创建对象失败，没找到该类配置：${typeId}；或缺失items字段。`);
            return null;
        }
        let obj = new ShowObj(...cfg.pos);
        cfg.items.forEach(i=>obj.ObjManager.add(new i.handler(i.setting)));
        this.objectHub.set(`@${senceId}&${typeId}#${objId}`,obj);
        return obj;
    }

    get(id){
        let obj = this.objectHub.get(id);
        return obj || this.create(id);
    }

    del(id){

    }

    update(t,_jGE){
        ;
    }

}
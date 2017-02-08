/*** 渲染对象类 ***/
class ShowObj extends Vector2D{
    constructor(...args){
        super(...args);

        let Objects = this.Objects = {        //负责处理的对象
            rObj: [],//渲染队列
            uObj: [],//更新队列
            items: new WeakSet()//对象管理
        };
        this.isDel = false;

        //对象管理器
        this.ObjManager ={
            add:function (obj) {
                if(!Objects.items.has(obj)){
                    Objects.items.add(obj);
                    Objects.uObj.push(obj);
                    if(obj.index == undefined) obj.index = 1;
                    if(!Array.isArray(Objects.rObj[obj.index])) Objects.rObj[obj.index] = [];
                    Objects.rObj[obj.index].push(obj);
                }
            },
            del:function (obj) {
                if(Objects.items.has(obj)){
                    obj.isDel=true;
                    Objects.items.delete(obj);
                }
            }
        };
    }

    update(t){
        this.Objects.uObj.forEach((o,i) => {
            if(o.isDel){
                this.Objects.uObj.splice(i,1);
            }else{
                o.update(t,_jGE);
            }
        });

        //清理渲染对象
        this.Objects.rObj.every(ol=>{
            ol.forEach((o,i)=>{if(o.isDel) this.Objects.rObj.splice(i,1);});
        });
    }
    render(ctx){
        this.Objects.rObj.every(o=>{
            for(let oo of o){
                if(oo.isDel){continue;}
                oo.render(ctx);
            }
        });
    }
}

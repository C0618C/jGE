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
        this.angle = 0;//朝向角度 (π -0.5π 0 0.5π)

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

    update(t,_jGE){
        this.Objects.uObj.forEach((o,i) => {
            if(o.isDel){
                this.Objects.uObj.splice(i,1);
            }else{
                o.update(t,new Vector2D(this),this.angle);
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


//一个由点和线渲染的部件
class $tk_path{
    constructor({type=null,styleType=null,style=null,points=null,pos=new Vector2D()}){
        this.fillStyle = null;
        this.strokeStyle = null;
        switch(styleType){
            case "fill":    this.fillStyle = style; break;
            case "stroke":  this.strokeStyle = style; break;
            case "both": ({fillStyle:this.fillStyle,strokeStylest:this.strokeStyle} = JSON.parse(style));break;
        }
        
        this.pos = new Vector2D(...pos);
        this.cPos = new Vector2D();
        this.points = [];
        points.forEach(p=>{this.points.push(new Vector2D(p[0],p[1]))});
        this.showPoints = [];
        this.isDel = false;
    }

    update(t,pPos,angle){
        let tPos = pPos.Add(this.pos.Turn(angle));
        this.showPoints = [];
        this.points.forEach(p=>{this.showPoints.push(tPos.Add(p.Turn(angle)));});

        this.cPos.Copy(pPos);
    }

    render(ctx){
        if(this.showPoints.length ==0 || this.isDel) return;
        ctx.save();
        ctx.beginPath();
        
        ctx.moveTo(this.showPoints[0].x,this.showPoints[0].y);
        for(let s of this.showPoints){
            ctx.lineTo(s.x,s.y);
        }
        if(this.fillStyle){
            ctx.fillStyle = this.fillStyle;
            ctx.fill();
        }
        if(this.strokeStyle){
            ctx.strokeStyle = this.strokeStyle;
            ctx.stroke();
        }

        //
        ctx.beginPath();
        ctx.moveTo(this.cPos.x,this.cPos.y);
        ctx.arc(this.cPos.x,this.cPos.y,2,0,2*π);
        ctx.fillStyle='red';
        ctx.fill();

        ctx.restore();
    }
}
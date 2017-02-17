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

class $$tk_base{
    constructor({styleType=null,style=null,pos=new Vector2D()}){
        this.fillStyle = null;
        this.strokeStyle = null;
        this.isAutoEnd = false;
        let sSet = "";
        switch(styleType){
            case "fill":    this.fillStyle = style; break;
            case "stroke": sSet = style; break;
            case "both": ({fillStyle:this.fillStyle,strokeStylest:sSet} = style);break;
        }
        if(sSet){
            [this.strokeStyle,this.lineWidth=1,this.lineCap='bull',this.lineJoin='miter'] = sSet.match(/(\w+)(?=\s|$)/g);
        }
        
        this.pos = new Vector2D(...pos);
        this.centerPoint = new Vector2D();  //部件的偏移中心
        this.cPos = new Vector2D();//DEBUG:测试用 父级所在位置 旋转中心点
        this.points = [];
        //points.forEach(p=>{this.points.push(new Vector2D(p[0],p[1]))});
        //this.showPoints = [];
        this.isDel = false;
    }
    //时间，所属元素位置，所属元素角度
    __update(t,pPos,angle){
       this.centerPoint=pPos.Add(this.pos.Turn(angle));
    }
    render(ctx){;}
    __draw(ctx,bef_d,aft_d){
        ctx.save();
        if(bef_d) bef_d(ctx);
        if(this.fillStyle){
            ctx.fillStyle = this.fillStyle;
            ctx.fill();
        }
        if(this.strokeStyle){
            ctx.strokeStyle = this.strokeStyle;
            ctx.lineWidth = this.lineWidth *1;
            ctx.lineCap = this.lineCap;
            ctx.lineJoin = this.lineJoin;
            if(this.isAutoEnd)ctx.closePath();
            ctx.stroke();
        }
        if(aft_d) aft_d(ctx);
        ctx.restore();
    }

    ____debug_show_cp(ctx){
        //DEBUG: 测试用代码
        ctx.beginPath();
        ctx.moveTo(this.cPos.x,this.cPos.y);
        ctx.arc(this.cPos.x,this.cPos.y,2,0,2*π);
        ctx.fillStyle='red';
        ctx.fill();
    }
}

//一个由点和线渲染的部件
class $tk_path extends $$tk_base{
    constructor({styleType=null,style=null,points=null,pos=new Vector2D()}){
        if(!points || points.length<=0) return null;
        super({styleType:styleType,style:style,pos:pos});
        //自动闭合路径
        this.isAutoEnd = (points[points.length-1] == -1)?(points.pop(),true):false;
        points.forEach(p=>{this.points.push(new Vector2D(p[0],p[1]))});
        this.showPoints = [];
    }

    update(t,pPos,angle){
        this.__update(t,pPos,angle);
        this.showPoints = [];
        this.points.forEach(p=>{this.showPoints.push(this.centerPoint.Add(p.Turn(angle*0)));});

        this.cPos.Copy(pPos);
        this.angle = angle;
    }

    render(ctx){
        if(this.showPoints.length ==0 || this.isDel) return;
        //ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.showPoints[0].x,this.showPoints[0].y);
        for(let s of this.showPoints){
            ctx.lineTo(s.x,s.y);
        }
        this.__draw(ctx);

        this.____debug_show_cp(ctx);
        //ctx.restore();
    }
}

//字体部件
class $tk_font extends $$tk_base{
    constructor({text="Text Unset",styleType=null,style=null,font="22px 微软雅黑",angle=0,pos=new Vector2D()}){
        super({styleType:styleType,style:style,pos:pos});
        this.font = font;
        this.angle = angle;
        this.text = text;
    }
    update(t,pPos,angle){
        this.__update(t,pPos,angle);
        this.angle = angle;

        this.cPos.Copy(pPos);
    }

    render(ctx){
        ctx.beginPath();

        this.__draw(ctx,false,()=>{
            ctx.font = this.font;
            ctx.rotate(this.angle);
            if(this.fillStyle) ctx.fillText(this.text,this.centerPoint.x,this.centerPoint.y);
            if(this.strokeStyle) ctx.strokeText(this.text,this.centerPoint.x,this.centerPoint.y);
        });

        this.____debug_show_cp(ctx);
    }

}
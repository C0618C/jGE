/*** 渲染对象类 ***/
class ShowObj extends Vector2D{
    constructor(...args){
        super(...args);
        let ObjManager = Symbol('ObjManager');

        let Objects = this.Objects = {        //负责处理的对象
            rObj: [],//渲染队列
            uObj: [],//更新队列
            items: new WeakSet()//对象管理
        };
        this.isDel = false;
        this.angle = 0;//朝向角度 (π -0.5π 0 0.5π)


        //对象管理器
        this[ObjManager] ={
            add:function (obj) {
                if(!Objects.items.has(obj)){
                    Objects.items.add(obj);
                    Objects.uObj.push(obj);
                    if(obj.render != undefined){
                        if(obj.index == undefined) obj.index = 1;
                        if(!Array.isArray(Objects.rObj[obj.index])) Objects.rObj[obj.index] = [];
                        Objects.rObj[obj.index].push(obj);
                    }
                }
            },
            del:function (obj) {
                if(Objects.items.has(obj)){
                    obj.isDel=true;
                    Objects.items.delete(obj);
                }
            }
        };

        this.add = this[ObjManager].add.bind(this);
    }

    update(t,_jGE){
        this.Objects.uObj.forEach((o,i) => {
            if(o.isDel){
                this.Objects.uObj.splice(i,1);
            }else{
                o.update(t,new Vector2D(this),this.angle);
            }
        });

        if(this._updateHandler) this._updateHandler(t,_jGE);

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

    set updateHandler(h){
        this._updateHandler = h.bind(this);
    }
}

class $$tk_base{
    constructor({styleType=null,style=null,pos=new Vector2D()}={}){
        this.fillStyle = null;
        this.strokeStyle = null;
        this.isAutoEnd = false;
        this.angle = 0;
        let sSet = "",fS="";
        switch(styleType){
            case "fill":    this.fillStyle = style; break;
            case "stroke": sSet = style; break;
            //NOTE:Fixed for Edge
            //case "both": ({fillStyle:this.fillStyle,strokeStylest:sSet} = style);break;
            case "both": ({fillStyle:fS,strokeStylest:sSet} = style);break;
        }
        if(sSet){
            //NOTE:Fixed for Edge
            //[this.strokeStyle,this.lineWidth=1,this.lineCap='bull',this.lineJoin='miter'] = sSet.split(' ');
            let [ss,lw=1,lc='bull',lJ='miter'] = sSet.split(' ');
            this.strokeStyle = ss;
            this.lineWidth=lw;
            this.lineCap = lc;
            this.lineJoin=lJ;
            this.fillStyle = fS;           
        }
        
        this.pos = new Vector2D(...pos);
        this.centerPoint = new Vector2D();  //部件的偏移中心
        //this.cPos = new Vector2D();//DEBUG:测试用 父级所在位置 旋转中心点

        this.isDel = false;
    }
    //时间，所属元素位置，所属元素角度
    update(t,pPos,angle){
       //this.centerPoint=pPos.Add(this.pos.Turn(angle));
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
            ctx.lineWidth = this.lineWidth*1;
            ctx.lineCap = this.lineCap;
            ctx.lineJoin = this.lineJoin;
            if(this.isAutoEnd)ctx.closePath();
            ctx.stroke();
        }
        if(aft_d) aft_d(ctx);
        ctx.restore();
    }

    // ____debug_show_cp(ctx){
    //     //DEBUG: 测试用代码
    //     ctx.beginPath();
    //     ctx.moveTo(this.cPos.x,this.cPos.y);
    //     ctx.arc(this.cPos.x,this.cPos.y,2,0,2*π);
    //     ctx.fillStyle='red';
    //     ctx.fill();
    // }
}

//一个由点和线渲染的部件
class $tk_path extends $$tk_base{
    constructor({styleType=null,style=null,points=null,pos=[0,0]}={}){
        if(!points || points.length<=0) return null;
        super({styleType:styleType,style:style,pos:pos});
        this.points = [];
        //自动闭合路径
        this.isAutoEnd = (points[points.length-1] == -1)?(points.pop(),true):false;
        points.forEach(p=>{this.points.push(Array.isArray(p)?( new Vector2D(p[0],p[1])):p)});        
    }

    update(t,pPos,angle){
        this.centerPoint=pPos.Add(this.pos.Turn(angle));
        this.angle = angle;
    }

    render(ctx){
        if(this.points.length == 0 || this.isDel) return;
        
        this.__draw(ctx,()=>{
            ctx.beginPath();
            ctx.translate(this.centerPoint.x,this.centerPoint.y);
            ctx.rotate(this.angle);
            ctx.moveTo(this.points[0].x,this.points[0].y);
            for(let s of this.points){
                ctx.lineTo(s.x,s.y);
            }
        },false);
    }
}

//一个由圆弧组成的部件 //TODO:弧形组件
class $tk_arc extends $$tk_base{
    constructor(){
        super({styleType:styleType,style:style,pos:pos});
    }
}

//图像精灵
class $tk_sprite{
    constructor({img={},pos=[0,0],area={width:img.width,height:img.height},sarea=null}={}){
        if(img == null) return null;
        this.img = img;
        this.barea = Object.freeze({width:area.width,height:area.height}); //原始尺寸
        this.area = area;
        this.sarea = sarea;
        this.pos = new Vector2D(...pos);
        this.dPos = new Vector2D();//画图时的左上角
        this.centerPoint = new Vector2D();//中心点
    }
    update(t,pPos,angle){
        this.centerPoint=pPos.Add(this.pos.Turn(angle));
        this.dPos.Copy(this.centerPoint);
        this.dPos.x -= this.area.width/2;
        this.dPos.y -= this.area.height/2;
        this.angle = angle;
    }
    render(ctx){
        ctx.save();
        ctx.translate(this.centerPoint.x,this.centerPoint.y);
        ctx.rotate(this.angle);
        if(this.sarea)   ctx.drawImage(this.img,this.sarea.x,this.sarea.y,this.sarea.width,this.sarea.height,-this.area.width/2,-this.area.height/2,this.area.width,this.area.height);
        else if(this.area) ctx.drawImage(this.img,-this.area.width/2,-this.area.height/2,this.area.width,this.area.height);

        ctx.restore();
    }
    scale(rate){
        this.area.width = this.barea.width*rate;
        this.area.height = this.barea.height*rate;
    }
}

//字体部件
class $tk_font extends $$tk_base{
    constructor({text="Text Unset",styleType="fill",style=null,font="22px 微软雅黑",angle=0,pos=[0,0]}){
        super({styleType:styleType,style:style,pos:pos});
        this.font = font;
        this.angle = angle;   //TODO:初始角度
        this.text = text;
    }
    update(t,pPos,angle){
        this.centerPoint=pPos.Add(this.pos.Turn(angle));
        this.angle = angle;
    }

    render(ctx){
        ctx.beginPath();

        this.__draw(ctx,false,()=>{
            ctx.font = this.font;
            ctx.translate(this.centerPoint.x,this.centerPoint.y);
            ctx.rotate(this.angle);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            if(this.fillStyle) ctx.fillText(this.text,0,0);
            if(this.strokeStyle) ctx.strokeText(this.text,0,0);
        });
    }
}

//视频部件
class $tk_video extends $tk_sprite{
    constructor(setting){
        setting.img = setting.video;
        super(setting);
        this.video = this.img;
        this.area.width = this.area.width||this.video.videoWidth;
        this.area.height = this.area.height||this.video.videoHeight;
        let area = this.area;
        this.barea = Object.freeze({width:area.width,height:area.height});
    }
    update(t,pPos,angle){
        super.update(t,pPos,angle);
        if(this.area.width == 0) this.area.width = this.video.videoWidth;
        if(this.area.height == 0) this.area.height = this.video.videoHeight;
    }
    pause(isStop){
        if(isStop === false) return this.video.play();
        return this.video.paused?this.video.play():this.video.pause();
    }
    loop(isLoop){
        this.video.loop = isLoop;
    }
    silent(isSilent){
        this.video.volume = isSilent?1:0;
    }

}

//动画部件
class $tk_animation extends $tk_sprite{
    //TODO: 动画的切片播放
    constructor({img=null,pos=[0,0],area={x:0,y:0,width:img.width,height:img.height},sarea=null,fps=8,frame=null,farea={width:0,height:0}}={}){
        if(!frame || farea.height <= 0|| farea.width <= 0){
            console.warn(`动画配置，帧数设置错误，详情请参看配置：${JSON.stringify([...arguments])}
            入参说明：area是当前图片的可视区，当多组sprite在同一个图片时，用于限定当前组的范围。若省略则用全图大小作范围。
            sarea 是最终输出时的裁切区。若省略则输出结果不裁切。 【暂未实现】
            farea 是帧长宽配置，本方法要求动画组的图片每帧尺寸一样。不可省略。
            `);
            return null;
        }
        //切帧
        let frames = [];
        let {x:curX,y:curY} = area;
        let curRow = 0;
        for(let f = 0;f<frame;f++){
            frames.push( {x:curX,y:curY} );
            curX += farea.width;
            if(curX>=area.width){
                curRow++;
                curX = area.x;
                curY += farea.height;
            }
        }

        super({img:img,pos:pos,area:farea,sarea:{x:frames[0].x,y:frames[0].y,width:farea.width,height:farea.height}});
        this.fps = Number(fps);
        this.frame = frame;     //总帧
        this.curFrame = 0;      //当前播放的帧
        this.playTime = 0;      //已经播放过的时间
        this.frames = frames;   //每帧的左上角顶点
        this.timeSpan = 1000/this.fps;
        
        console.dir(this);
        
    }

    update(t,pPos,angle){
        super.update(t,pPos,angle);

        //TODO:丰富动画部件的各种模式（往复播放，播放区裁切）
        this.playTime += t;
        if(this.playTime>=this.timeSpan){
            this.curFrame++;
            if(this.curFrame>=this.frame) this.curFrame = 0;

            this.sarea.x = this.frames[this.curFrame].x;
            this.sarea.y = this.frames[this.curFrame].y;
            this.playTime %= this.timeSpan;
        }
    }

}
class MObj extends ShowObj{
    get target(){
        return this.__tg;
    }
    set target(v){
        this.__tg = v;
    }
    constructor(...args){
        super(...args);

        //this.__tg = new Vector2D(0,0);
        this.target = new Vector2D(500,300);

        //徘徊用变量
        this.wander={
            tp:new Vector2D(),//范围圆心
            radius:22,      //随机半径
            distance:42,    //突出距离
            jitter:40       //随机位移最大值
        };

        this.followpath={
            points:[],
            minWidth:0,
            maxWidth:800,
            minHeight:0,
            maxHeight:600
        };

        this.velocity = new Vector2D(220,50);         //速度 v
        this.speed = 150;//px/s  最大速率
        this.rSpeed = 0;//角速度
        this.l = 10;//三角形外观参数
        this.r = Math.PI;

        this.tw = 0;//wander时用的当前朝向

        this.a = new Vector2D();
        this.b = new Vector2D();
        this.c = new Vector2D();
        this.CurAction = this.Seek;
        this._steps=[];
    }

    //走
    Go(t){
        let v = this.velocity.Multiply(t/1000);
        this.AddIn(v);
        this._steps.push(new Vector2D(this));
    }

    //靠近
    Seek(t,v_tg){
        // let tempP=this.Minus(this.a).Normalize();
        // tempP.MultiplyIn(-this.speed*t/1000);
        // this.AddIn(tempP);

        //
        let dv =  this.Minus(v_tg).Normalize().Multiply(this.speed*t/1000);
        this.AddIn(dv.Minus(this.velocity));
    }

    //离开
    Flee(t,v_tg){
        let dv =  v_tg.Minus(this).Normalize().Multiply(this.speed*t/1000);
        this.AddIn(dv.Minus(this.velocity));
    }

    //抵达
    Arrive(v,deceleration){}

    //追逐
    Pursuit(v){}

    //逃避
    Evade(v){}

    //徘徊
    Wander(t){
        //算法有瑕疵 需优化
        const jit = this.wander.jitter * t/1000;
        const tget = new Vector2D(RandomClamped()*jit,RandomClamped()*jit);//new Vector2D(this.target);

        this.target = tget.Normalize();
        this.target.MultiplyIn(this.wander.radius);
        if(this.tw == 0)
            this.target = this.target.Add( new Vector2D(this.wander.distance,0));
        else
            this.target = this.target.Minus( new Vector2D(this.wander.distance,0));

        this.target.AddIn(this);
        //console.log(this.target);
    }

    //避障
    ObstacleAvoidance(obstacles){}

    //避墙
    WallAvoidance(walls){}

    //插入
    Interpose(){}

    //躲藏
    Hide(){}

    //跟随路径
    FollowPath(t){
        if(this.followpath.points.length <= 1){
            const num = Math.floor(Math.random()*100)%20;
            for(let j=0;j<num;j++){
                const x = Math.floor(Math.random()*100000)%(this.followpath.maxWidth - this.followpath.minWidth)+this.followpath.minWidth;
                const y = Math.floor(Math.random()*100000)%(this.followpath.maxHeight - this.followpath.minHeight)+this.followpath.minHeight;
                this.followpath.points.push(new Vector2D(x,y));
            }
        }
        if(this.target.Minus(this).Length()<=this.speed*t/1000){
//            console.log("A:",this.target,this,this.target.Minus(this).Length(),this.speed*t/1000);
            //this.target.Copy(this.followpath.points.shift());
            this.target = this.followpath.points.shift();
//            console.log("B:",this.target,this,this.target.Minus(this).Length(),this.speed*t/1000);
        }
    }

    //队形
    OffsetPursuit(leader,offset){}

    //分离
    Separation(){}

    //队列
    Alignment(){}

    //聚集
    Cohesion(){}

    //群集
    Flocking(){}

    render(c2d){
        // //c2d
        if(!false){
            c2d.beginPath();
            c2d.strokeStyle = 'red';
            c2d.fillStyle = 'darkred';
            c2d.lineWidth = 1;
            c2d.arc(this.x, this.y, this.l * 2, this.r + Math.PI / 2, 2 * Math.PI + this.r + Math.PI / 2);
            c2d.fill();

            //画轨迹
            c2d.beginPath();
            c2d.moveTo(this._steps[0].x,this._steps[0].y);
            for(let s of this._steps){
                c2d.lineTo(s.x,s.y);
            }
            c2d.strokeStyle = "#888888";
            c2d.stroke();

            if(this.CurAction == this.Wander){  //徘徊用辅助
                c2d.beginPath();
                c2d.moveTo(this.wander.tp.x, this.wander.tp.y);
                c2d.arc(this.wander.tp.x, this.wander.tp.y, this.wander.radius, 0, 2 * Math.PI);
                c2d.strokeStyle = 'yellow';
                c2d.stroke();
            }else if(this.CurAction == this.FollowPath){
                c2d.fillStyle='pink';
                c2d.strokeStyle = 'lightgray';
                let curP = this.target;
                for(var p of this.followpath.points){
                    c2d.beginPath();
                    c2d.arc(p.x,p.y,2,0,2*Math.PI);
                    c2d.closePath();
                    c2d.fill();
                    c2d.beginPath();
                    c2d.moveTo(curP.x,curP.y);
                    c2d.lineTo(p.x,p.y);
                    c2d.closePath();
                    c2d.stroke();
                    curP.Copy(p);
                }
            }

            c2d.beginPath();
            c2d.moveTo(this.a.x,this.a.y);
            c2d.lineTo(this.b.x,this.b.y);
            c2d.lineTo(this.c.x,this.c.y);
            c2d.fillStyle='blue';
            c2d.fill();

            //target
            if(this.target != null){
                c2d.beginPath();
                c2d.moveTo(this.x, this.y);
                c2d.lineTo(this.target.x, this.target.y);
                c2d.strokeStyle = 'green';
                c2d.stroke();
                c2d.beginPath();
                c2d.strokeStyle = 'red';
                c2d.fillStyle='black';
                c2d.arc(this.target.x, this.target.y, 5, 0, 2 * Math.PI);
                c2d.fill();
                c2d.moveTo(this.target.x-10,this.target.y);
                c2d.lineTo(this.target.x+10,this.target.y);
                c2d.moveTo(this.target.x,this.target.y-10);
                c2d.lineTo(this.target.x,this.target.y+10);
                c2d.closePath();
                c2d.stroke();
            }
        }
    }

    update(t,world){
        const w_s = world.GetSetting();
        //环形世界设置
        if(w_s.isRoundWorld){
            const ar = world.GetArea();
            // if(this.x >= ar.width){this.tw = 1;}
            // if(this.x < 0) {this.tw = 0;}
            if(this.x >= ar.width){this.x = 0;}
            if(this.x < 0) {this.tw = ar.width;}
            if(this.y >= ar.height) this.y-= ar.height;
            if(this.y < 0) this.y = ar.height;
        }

        //行为驱动
        if(this.IsArive(t)){
            this.CurAction(t,this.target);
        }else{
            this.Go(t);
        }

        //计算外形基点
        this.a=this.Add((new Vector2D({x:0*this.l,y:2*this.l})).Turn(this.r));
        this.b=this.Add((new Vector2D({x:-1*this.l,y:-1.5*this.l})).Turn(this.r));
        this.c=this.Add((new Vector2D({x:1*this.l,y:-1.5*this.l})).Turn(this.r));

        //使朝向与目标点一致
        // const tv=this.target.Minus(this);
        // if(tv.y == 0) this.r = Math.PI;
        // else this.r = (tv.y<0?Math.PI:0)-Math.atan(tv.x/tv.y);
        // if(this.r == NaN) this.r = 0;

        //使朝向与速度一致
        //let
        this.r = -Math.atan(this.velocity.x/this.velocity.y);

        if(this.CurAction == this.Wander) {
            this.wander.tp = this.Minus(this.a).Normalize();
            this.wander.tp.MultiplyIn(-this.wander.tp.Length() - this.wander.distance);
            this.wander.tp.AddIn(this);
        }
    }

    IsArive(t){
        if(this.target == null) return false;
        const des = this.speed*t/1000;
        return this.target.Minus(this).LengthSq()<=des
            ||(this.CurAction == this.Wander &&this.target.Minus(this).Length()> this.wander.distance*1.5);
    }
}
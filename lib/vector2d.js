'use strict';

class Vector2D {
    constructor(...args) {
        //args.length == 1?({x:this.x = 0,y:this.y=0} = args[0]):([this.x = 0,this.y=0]=args);
        //NOTE:Fixed for Edge
        let a,b;
        args.length == 1?({x:a = 0,y:b=0} = args[0]):([a = 0,b=0]=args);
        this.x = a;
        this.y = b;
    }

    Copy(v2){this.x=v2.x,this.y=v2.y;}

    Zero() {};
    isZero() {return this.x===0&&this.y===0;};

    //模长 |v|
    Length() {return Math.sqrt(this.x*this.x+this.y*this.y);}
    LengthSq() {return this.x*this.x+this.y*this.y;}

    //归一化 大小不变的单位矢量 v/|v|
    Normalize() { var IvI=this.Length(); return new Vector2D(this.x/IvI,this.y/IvI);};

    //点乘 u·v = uxvx+uyvy
    Dot(u) {return this.x*u.x+this.y*u.y;};

    //方向 适用于y轴朝下x朝右的坐标
    /* 如果v2 在当前矢量的顺时针方向 返回正值
     * 如果v2 在当前矢量的逆时针方向 返回负值
    */
    Sign(v2) {
        //TODO:未完成
    };

    //取得当前矢量的正交矢量
    Perp() {
        //TODO:未完成
    };

    //调整x和y使矢量的长度不会超过最大值
    Truncate(max) {
        //TODO:未完成
    };

    //返回v与v2之间的距离
    Distance(v2) {
        return Math.sqrt(this.DistanceSq(v2));
    };
    DistanceSq(v2) {
        //TODO:未完成
    };

    //返回v的相反矢量
    GetReverse() {
        //TODO:未完成
    };

    //向量加
    AddIn(v2){this.x+=v2.x;this.y+=v2.y;}
    //向量乘
    MultiplyIn(a){this.x*=a;this.y*=a;}

    //加
    Add(v2){return new Vector2D(this.x+v2.x,this.y+v2.y);}
    //减 v-v2=（X1-X2，Y1-Y2）
    Minus(v2){return new Vector2D(this.x-v2.x,this.y-v2.y);}
    //乘
    Multiply(a){return new Vector2D(this.x*a,this.y*a);}

    //旋转角度 x*cosA-y*sinA  x*sinA+y*cosA
    Turn(A){return new Vector2D(this.x*Math.cos(A)-this.y*Math.sin(A),this.x*Math.sin(A)+this.y*Math.cos(A));}

    //相等
    Equal(v2){return this.x == v2.x && this.y==v2.y;}
}

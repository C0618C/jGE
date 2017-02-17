class UT{
    static Auto_Test(x){
        this.Test_tk_Path(x);
        this.Test_tk_Text(x);
    }
    static Test_tk_Path(x){
        console.info("开始执行-显示对象-路径部件测试");
        console.profile("tk_path_001");
        let p1 = new $tk_path({styleType:'fill',style:'blue',points:[[0,20],[-10,-15],[10,-15]],pos:[30,0]});
        let p2 = new $tk_path({styleType:'both',style:{fillStyle:"red",strokeStylest:"yellow 2"} ,points:[[0,20],[-10,-15],[10,-15],-1],pos:[-30,0]});
        let s1 = new ShowObj(300,500);
        s1.ObjManager.add(p1);
        s1.ObjManager.add(p2);
        x.ObjManager.add(s1);

        setInterval(()=>{s1.angle+=0.01;if(s1.angle>=2*π)s1.angle-=2*π;},32);
        console.profileEnd("tk_path_001");
    }

    static Test_tk_Text(x){
        console.info("开始执行-显示对象-文本部件测试");
        console.profile("tk_text_001");
        let f1 = new $tk_font({text:'哈哈，我能显示啊',styleType:'stroke',style:'green 1',font:'50px 微软雅黑',pos:[0,0]});
        let s1 = new ShowObj(100,100);
        s1.ObjManager.add(f1);
        x.ObjManager.add(s1);

        setInterval(()=>{s1.angle-=0.01;if(s1.angle<0)s1.angle+=2*π;},32);
        console.profileEnd("tk_text_001");
    }
}

(function(){
    ;
})();
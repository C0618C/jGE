/**
 * 提供jGE可用性的检查和提示 本模块可直接排除而不影响其它功能
 * 
 * 
 * 若需要检测并提示可用性，请在需检测页面通过script标签引入本文件（默认提示需要在body标签之中或之后）。
 * 
 * 使用时请修改提示语/提示方式
 */

(function (){
    //通过检查Symbol对象判断是否支持ES6
    if(typeof Symbol == typeof undefined){
        document.body.innerHTML="<h3>抱歉，您当前所用的浏览器不支持jGE。</h3><p>因jGE基于ES6语法所写，在不支持ES6的浏览器上，jGE无法运行。请改用最新版谷歌浏览器（Chrome）试试。</p>"
    }
})();
let url  = require("url"),
     fs=require("fs"),
     http=require("http"),
     path = require("path"),
     open = require('opn');
let [v_port,local,fpath] = process.argv.splice(2);
http.createServer(function (req, res) {
    var pathname=__dirname.replace(/\/|\\test/i,"")+decodeURI( url.parse(req.url).pathname);
    console.log("请求资源："+pathname)
    if (path.extname(pathname)=="") {
        pathname+="/";
    }
    if (pathname.charAt(pathname.length-1)=="/"){
        pathname+="index.html";
    }
    
    fs.exists(pathname,function(exists){
        if(exists){
            switch(path.extname(pathname)){
                case ".html":
                    res.writeHead(200, {"Content-Type": "text/html"});
                    break;
                case ".js":
                    res.writeHead(200, {"Content-Type": "text/javascript"});
                    break;
                case ".css":
                    res.writeHead(200, {"Content-Type": "text/css"});
                    break;
                case ".gif":
                    res.writeHead(200, {"Content-Type": "image/gif"});
                    break;
                case ".jpg":
                    res.writeHead(200, {"Content-Type": "image/jpeg"});
                    break;
                case ".png":
                    res.writeHead(200, {"Content-Type": "image/png"});
                    break;
                case ".pdf":
                    res.writeHead(200, {"Content-Type": "application/pdf"});
                    break;
                default:
                    res.writeHead(200, {"Content-Type": "application/octet-stream"});
            }

            fs.readFile(pathname,function (err,data){
                res.end(data);
            });
        } else {
            console.warn("获取资源失败："+pathname);
            res.writeHead(404, {"Content-Type": "text/html"});
            res.end("<h1>404 Not Found</h1>");
        }
    });
}).listen(v_port);

if(/\.(?:js|css|json|cfg|md|ico)/.test(fpath)){
    open(`http://127.0.0.1:${v_port}/`);
}else{
    let tPath = fpath.replace(local,"").replace("\\","/");
    open(`http://127.0.0.1:${v_port}`+tPath);
}
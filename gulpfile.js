var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var composer = require('gulp-uglify/composer');
var minify = composer(uglify, console);

gulp.task('default', function(cb) {
    let model = [
        "./lib/vector2d.js"
        // ,"./lib/ShowObj.js"
        // ,"./lib/jGE.js"
        // ,"./lib/EventManager.js"
        // ,"./lib/ObjectFactory.js"
        // ,"./lib/ResManager.js"
        // ,"./lib/SceneManager.js"
        // ,"./lib/Keyboard.js"
        // ,"./lib/jGE.config.js"
        // ,"./lib/tool.js"
        // ,"./lib/MObj.js"
    ];
    console.log(`开始生成 jGE，包含的模块有：${model.join('').replace(/\.\/lib\//g,'').replace(/\.js/g,'\n')}`)
    let rsl = gulp.src(model)
                    .pipe(concat('jGE.Full.min.js'))
                    .pipe(minify({}))
                    .pipe(gulp.dest('./release/'));
    console.log("生成完毕。");
    return rsl;
});
var gulp = require('gulp');
var concat = require('gulp-concat');
var del = require('del');
var uglifyes = require('uglify-es');
var composer = require('gulp-uglify/composer');
var minify = composer(uglifyes, console);

// //是否开启高可用性检查（浏览器不支持时直接提示）
// let isHightAvailability = false;

let model = [
     "./lib/tool.js"
    , "./lib/vector2d.js"
    , "./lib/ShowObj.js"
    , "./lib/jGE.js"
    , "./lib/EventManager.js"
    , "./lib/ObjectFactory.js"
    , "./lib/ResManager.js"
    , "./lib/SceneManager.js"
    , "./lib/Keyboard.js"
    , "./lib/jGE.config.js"
    //,"./lib/jGE.Debug.js"
];

console.log(`准备生成 jGE，包含的模块有：\n${model.join('').replace(/\.\/lib\//g, '').replace(/\.js/g, '\n')}`)

gulp.task('clean', function () {
    console.log("....清理输出文件....")
    return del(['release']);
});


gulp.task('jGE-Full', ['clean'], function (cb) {
    let rsl = gulp.src(model)
        .pipe(concat('jGE.js'))
        .pipe(gulp.dest('./release/'));
    return rsl;
});

gulp.task('jGE-min', ['jGE-Full'], function () {
    return gulp.src("./release/jGE.js")
        .pipe(concat('jGE.min.js'))
        .pipe(minify({}))
        .pipe(gulp.dest('./release/'));
});

// gulp.task('AvailabilityCheck', ['jGE-min'], function () {
//     if(isHightAvailability){
//         gulp.src(["./lib/Availability.js","./release/jGE.js"])
//         .pipe(concat('jGE.js'))
//         .pipe(gulp.dest('./release/'));

//         return gulp.src(["./lib/Availability.js","./release/jGE.min.js"])
//         .pipe(concat('jGE.min.js'))
//         .pipe(gulp.dest('./release/'));
//     }
// });

gulp.task('default', ['clean', 'jGE-Full', 'jGE-min'/*,'AvailabilityCheck'*/]);
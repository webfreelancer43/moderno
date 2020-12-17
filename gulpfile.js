const { src, dest, parallel, series, watch } = require('gulp');     //Подключаем к проекту галп.
const browserSync   = require('browser-sync').create();             //Подключаем BS, здесь же задаем параметр подключения .create, т.е мы создаем новое подключение.
const concat        = require('gulp-concat');
const uglify        = require('gulp-uglify-es').default;
const sass          = require('gulp-sass');
const autoprefixer  = require('gulp-autoprefixer');
const cleancss      = require('gulp-clean-css');
const imagemin      = require('gulp-imagemin');
const newer         = require('gulp-newer');
const del           = require('del');
//Создаем константу и ей присваиваем то, что будет запускаться при использовании этой константы

function browsersync() {
    browserSync.init({                  //Инициализируем BS
        server: { baseDir: 'app/' },    //расположение сервера
        notify: false,                  //уведомления отключить/включить
        online: true,                   //работа с интернетом да/нет
    })
}

function images() {
    return src(
        'app/images/src/**/*'
    )
    .pipe(newer('app/images/dest/'))
    .pipe(imagemin())
    .pipe(dest('app/images/dest/'))
}

function styles() {                     //захват css
    return src([
        'node_modules/normalize.css/normalize.css',
        'app/scss/style.scss'
    ])
    .pipe(sass())
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({overrideBrowserslist : ['Last 10 versions'], grid : true}))
    .pipe(cleancss(( {level : { 1: {specialComments: 0} }}, {format: 'compressed'} )))
    .pipe(dest('app/css/'))
    .pipe(browserSync.stream())
}

function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.min.js',
        'app/js/main.js',                //Файлы которые будут обрабатываться как-то
    ])
        .pipe(concat( 'main.min.js' ))   //Конкатинироваться файлы будут в файл app.min.js.
        .pipe(uglify())
        .pipe(dest( 'app/js/' ))        //Выгружаться файл будет в эту папку.
        .pipe(browserSync.stream())
}

function cleanimg() {
    return del('app/images/dest/**/*', { force: true })
}

function cleandist() {
    return del('dist/**/*', { force: true })
}

function buildcopy() {
    return src([
        'app/css/**/*.min.css',
        'app/js/**/*.min.js',
        'app/images/dest/**/*',
        'app/**/*.html',
    ], {base : 'app'}) //Чтобы появились папки откуда мы берем
    .pipe(dest('dist'))
}

function startwatch(){
    watch(['app/**/*.js', '!app/**/*.min.js'], scripts)
    watch('app/**/*.scss', styles)
    watch('app/**/*.html').on('change', browserSync.reload)
    watch('app/images/src/**/*', images)    //Наблюдаем за изображениями и выполняем функцию images
}

exports.browsersync = browsersync;
exports.scripts     = scripts;
exports.styles      = styles;
exports.images      = images;
exports.cleanimg    = cleanimg;
exports.build       = series(cleandist, styles, scripts, images, buildcopy);//Последовательное выполнение

exports.default     = parallel(styles, scripts, browsersync, startwatch);
const path = require('path')
const fs = require('fs')
const gulp = require('gulp')
const del = require('del')
const data = require('gulp-data')
const nunjucks = require('gulp-nunjucks')
const stylus = require('gulp-stylus')
const autoprefixer = require('gulp-autoprefixer')
const babel = require('gulp-babel')
const browsersync = require('browser-sync').create()
const eslint = require('gulp-eslint')
const stylint = require('gulp-stylint')
const htmlmin = require('gulp-htmlmin')
const cleancss = require('gulp-clean-css')
const uglify = require('gulp-uglify')
const slugg = require('slugg')
const ghPages = require('gulp-gh-pages')

// convert given string to url-safe slug
const slugify = function slugify (str) {
    return slugg(str)
}

/* Supporting tasks
---------------------------------------------------------------- */

gulp.task('clean', (done) => {
    return del('dist', done)
})

gulp.task('html', () => {
    const jsonFile = path.resolve(__dirname, './src/data.json')
    return gulp.src(['src/html/**/*', '!src/html/**/_*'])
        .pipe(data(() => {
            return JSON.parse(fs.readFileSync(jsonFile, 'utf8'))
        }))
        .pipe(nunjucks.compile({slugify:slugify}))
        .pipe(gulp.dest('dist'))
})

gulp.task('css', () => {
    return gulp.src('src/styles/main.styl')
        .pipe(stylus({ 'include css': true }))
        .pipe(autoprefixer())
        .pipe(gulp.dest('dist/styles'))
        .pipe(browsersync.stream())
})

gulp.task('js', () => {
    return gulp.src('src/scripts/**/*')
        .pipe(babel())
        .pipe(gulp.dest('dist/scripts'))
})

gulp.task('serve', () => {
    browsersync.init({
        server: {
            baseDir: './dist'
        },
        port: 3333,
        notify: false,
        open: false
    })
})

gulp.task('reload', (done) => {
    browsersync.reload()
    done()
})


/* Watch tasks
---------------------------------------------------------------- */

gulp.task('watch:html', () => {
    gulp.watch('src/html/**/*', gulp.series('html', 'reload'))
})

gulp.task('watch:styles', () => {
    gulp.watch('src/styles/**/*', gulp.series('css'))
})

gulp.task('watch:js', () => {
    gulp.watch('src/scripts/**/*', gulp.series('js', 'reload'))
})

gulp.task('watch', gulp.parallel('watch:html', 'watch:styles', 'watch:js'))


/* Linting tasks
---------------------------------------------------------------- */

gulp.task('lint:js', () => {
    return gulp.src('src/scripts/**/*.js')
        .pipe(eslint())
        .pipe(eslint.format())
})

gulp.task('lint:stylus', () => {
    return gulp.src('src/styles/**/*')
        .pipe(stylint())
        .pipe(stylint.reporter())
})

gulp.task('lint', gulp.series('lint:js', 'lint:stylus'))


/* Minification/prod tasks
---------------------------------------------------------------- */

gulp.task('minify:html', () => {
    return gulp.src('dist/**/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist'))
})

gulp.task('minify:css', () => {
    return gulp.src('dist/styles/**/*.css')
        .pipe(cleancss({compatibility:'ie8'}))
        .pipe(gulp.dest('dist/styles'))
})

gulp.task('minify:js', () => {
    return gulp.src('dist/scripts/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/scripts'))
})


/* Primary tasks
---------------------------------------------------------------- */

gulp.task('build', gulp.series('clean', gulp.parallel('html', 'css', 'js')))

gulp.task('default', gulp.series('build', gulp.parallel('serve', 'watch')))

gulp.task('production', gulp.series('build', gulp.parallel('minify:html', 'minify:css', 'minify:js')))


/* Deploy to gh-pages branch
---------------------------------------------------------------- */

gulp.task('deploy', function() {
    return gulp.src('./dist/**/*')
        .pipe(ghPages());
});

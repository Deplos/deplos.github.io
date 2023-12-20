
const gulp = {
    stylus: require("gulp-stylus"),
    terser: require("gulp-terser"),
};

const { compileAllLocales, compileLocale, pugCompileIndex } = require("./locale");
const { src, dest, watch, parallel, series } = require("gulp");

const jsFiles = "src/js/**/**.js";


function pug(done) {
    return series(...compileAllLocales(), pugCompileIndex)(done);
}

function stylus() {
    return src(["src/stylus/main.styl", "src/stylus/pages/*.styl"])
        .pipe(
            gulp.stylus({
                compress: true,
                "include css": true
            })
        )
        .pipe(dest("dist/assets/css"));
}

function js() {
    return src(jsFiles).pipe(gulp.terser()).pipe(dest("dist/assets/js"));
}

function fonts() {
    return src("src/fonts/*.woff2").pipe(dest("dist/assets/fonts"));
}

function meta() {
    return src("src/meta/*.@(txt|json|xml|html|js)").pipe(dest("dist/"))
}

function images() {
    return src("src/images/**/*.@(png|jpg|svg|webp)").pipe(
        dest("dist/assets/images")
    );
}

function all() {
    return parallel(pug, stylus, js, fonts, images, meta);
}

function server() {
    const sync = require("browser-sync").create()
    sync.init({
        server: {
            baseDir: "./dist",
        },
    });

    const config = [
        [["src/pug/**/*.pug", "src/locales/*.json"], compileLocale("ru")],
        [[jsFiles], js],
        // [["src/pug/404.pug", "src/pug/index.pug"], pugCompileIndex]
        [["src/stylus/**/*.styl"], stylus],
    ];

    config.forEach((args) => watch(...args).on("change", sync.reload));
}

if (process.env.NODE_ENV === "production") exports.default = all();
else exports.default = server;

exports.static = parallel(fonts, images);

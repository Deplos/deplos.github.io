const { readFileSync, readdirSync } = require("fs");
const { src, dest } = require("gulp");
const gulp = {
    pug: require("gulp-pug"),
    data: require("gulp-data"),
    dom: require("gulp-dom"),
};
const locales = readdirSync("./src/locales/")
    .filter((file) => file.endsWith(".json"))
    .map((locale) => locale.slice(0, -5));


function replaceKeysWithValues(obj, options) {
    const regex = /\[(\w+)\]/g;
    const replacer = (match, key) => options[key];

    const replaceRecursive = (obj) => {
        if (typeof obj !== "object" || obj === null) {
            return obj;
        }
        const replacedObj = Array.isArray(obj) ? [] : {};
        for (let [key, value] of Object.entries(obj)) {
            replacedObj[key] = replaceRecursive(value);
            if (typeof replacedObj[key] === "string") {
                replacedObj[key] = replacedObj[key].replace(regex, replacer);
            }
        }
        return replacedObj;
    }

    return replaceRecursive(obj);
}


function getLocales(locale) {
    return function (file) {
        const data = JSON.parse(readFileSync(`./src/locales/${locale}.json`));
        const config = require("./src/config.json");
        const websites = require("./src/websites.json")
        const page = file.path.split("/").pop().split(".").at(-2);

        const plansPages = ["plans", "index"]
        const formPages = ["index", "partners", "support"]
        const media = new Proxy(config.media, {
            get(target, prop) {
                if (target[prop] === undefined) return undefined
                if (prop === "phone") return `${websites[prop]}${target[prop]}`

                return `https://${websites[prop]}${target[prop]}`
            }
        })


        const translation = {
            ...data,
            ...replaceKeysWithValues(data.pages[page], config.info),
            media,
            rawMedia: config.media,
            $locale: {
                currentLocale: locale,
                currentPage: page === "index" ? "" : page + ".html",
                locales: locales.filter(l => l !== locale)
            },
            $helpers: {
                toPage(name) {
                    return `/${name}.html`
                },
                toService(name) {
                    return `https://${name}.${config.info.url}`
                }
            },
            $info: config.info,
            $ads: config.ads
        };

        if (plansPages.includes(page)) translation.plans = config.plans;
        else delete translation.specs;
        if (page === "creators") translation.creators = config.creators
        if (page === "index") translation.services = config.services
        if (page === "locations") translation.locations = config.locations

        if (!formPages.includes(page)) delete translation.form;
        delete translation.pages;


        return translation;
    };
}

function changeLinks(locale) {
    return function () {
        function addPrefix(obj, selector, prefix, attr) {
            obj.querySelectorAll(selector).forEach(
                (link) => !link[attr].startsWith("https://") ? (link[attr] = `/assets/${prefix}${link[attr]}`) : null
            );
        }

        this.querySelectorAll('a[href]:not([href*=":"])').forEach((link) => {
            if (link.hasAttribute("absolute")) return link.removeAttribute("absolute");

            link.href = `/${locale}${link.href}`;
        });

        addPrefix(this, 'link[rel="stylesheet"]', "css", "href");
        addPrefix(this, "img[src]", "images", "src");
        addPrefix(this, "script[src]", "js", "src");

        return this;
    };
}

function pugCompileLocale(locale) {
    return () => {
        return src(["src/pug/pages/*.pug","!src/pug/index.pug","!src/pug/404.pug"])
            .pipe(gulp.data(getLocales(locale)))
            .pipe(gulp.pug({}))
            .pipe(gulp.dom(changeLinks(locale)))
            .pipe(dest(`dist/${locale}`));
    };
}

function pugСompileAllLocales() {
    return locales.map((locale) => pugCompileLocale(locale));
}

function pugCompileIndex() {
    return src(["src/pug/index.pug", "src/pug/404.pug"])
        .pipe(gulp.pug({}))
        .pipe(dest(`dist/`));
}

module.exports.compileLocale = pugCompileLocale;
module.exports.compileAllLocales = pugСompileAllLocales;
module.exports.pugCompileIndex = pugCompileIndex;

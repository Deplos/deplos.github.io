export function getLanguage() {
    return document.body.getAttribute("lang");
}

export function getPage() {
    let page = document.body.getAttribute("page").slice(0, -".html".length);
    page = page === "" ? "index" : page

    return page;
}
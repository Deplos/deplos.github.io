import { getLanguage } from "./lib/getInfo.js";
import { GuideController } from "./guide/guideController.js";

const guideController = new GuideController(getLanguage());
/**
 * 
 * @param {import("./guide/guide.d.ts").Guide} guide 
 */
function setGuide(guide) {
    const guideElement = document.querySelector(".guide");

    guideElement.innerHTML = `
        <img src="${guide.previewUrl ?? ""}" alt="${guide.title}" class="guide__image  ${guide.previewUrl ? "loaded" : ""}">
        <div class="guide__info">
            <div class="guide__tags">
                ${guide.tags.map((tag) => `<span class="tag" data-id="${tag.id}">${tag.name}</span>`).join("")}
            </div>
            <div class="guide__date">${guide.updatedAt.toLocaleDateString()}</div>
        </div>
        <h2 class="guide__title">${guide.title}</h2>
        <p class="guide__content"></p>
    `
}

function setContent(json) {
    const html = documentToHtmlString(json);

    document.querySelector(".guide__content").innerHTML = html;
}

function redirect() {
    return window.location.replace(`/${getLanguage()}/guides.html`)
}

async function init() {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) return redirect()


    const guide = await guideController.getGuide(id);
    if (!guide) return redirect()

    setGuide(guide);
    setContent(guide.content);
}

init()
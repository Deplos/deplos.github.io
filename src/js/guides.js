import { GuideController } from "./guide/guideController.js";
import { getLanguage } from "./lib/getInfo.js";



const guideController = new GuideController(getLanguage());

/**
 * 
 * @param {import("./guide/guide.js").PreviewGuide[]} guides 
 */
function setGuides(guides) {
    const guidesContainer = document.querySelector(".guides");

    guidesContainer.innerHTML = "";

    if (!guides.length) {
        return guidesContainer.classList.value = "guides empty";
    };

    guidesContainer.classList.value = "guides";

    guides.forEach((guide) => {
        const guideElement = document.createElement("a");

        guideElement.classList.add("guide");
        guideElement.setAttribute("href", `/${getLanguage()}/guide.html?id=${guide.id}`);
        guideElement.innerHTML = `
            <img src="${guide.previewUrl ?? ""}" alt="${guide.title}" class="guide__image ${guide.previewUrl ? "loaded" : ""}">
            <div class="guide__info">
                <div class="guide__tags">
                    ${guide.tags.map((tag) => `<span class="tag" data-id="${tag.id}">${tag.name}</span>`).join("")}
                </div>
                <div class="guide__date">${guide.updatedAt.toLocaleDateString()}</div>
            </div>
            <h3 class="guide__title">${guide.title}</h3>
     
        `;

        guidesContainer.appendChild(guideElement);
    })
}

function setupSearch() {
    const search = document.getElementById("search");

    search.addEventListener("keyup", async (e) => {
        if (e.key !== "Enter") return;
        const searchValue = e.target.value;

        if (searchValue === "") {
            const guides = await guideController.getAllGuides();
            setGuides(guides);
            return;
        }

        const guides = await guideController.searchGuides(searchValue);


        setGuides(guides);
    })
}

async function init() {
    setupSearch();
    setGuides(await guideController.getAllGuides());
}

init();


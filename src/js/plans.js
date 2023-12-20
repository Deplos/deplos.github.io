const forbiddenCountries = ["BY", "RU"]

function checkByTimeZone() {
    const currentCountry = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return forbiddenCountries.includes(currentCountry);
}

async function checkByIp() {
    const API = "https://get.geojs.io/v1/ip/country.json"
    const { country } = await fetch(API).then(res => res.json())

    return forbiddenCountries.includes(country);
}

function hidePrices() {
    const planPriceClass = "plan__price"
    const plansPrices = document.querySelectorAll("." + planPriceClass);

    plansPrices.forEach((price) => {
        price.classList.add(`${planPriceClass}--hidden`);
    });
}

async function check() {
    if (checkByTimeZone()) return hidePrices();
    if (await checkByIp()) return hidePrices();
} 

check()

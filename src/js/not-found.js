const availableLocales = ["ru", "en"]
const currentLocale = availableLocales.includes(location.pathname.split("/")[1]) 
    ? location.pathname.split("/")[1] 
    : "en"

location.replace(`/${currentLocale}/error.html`)
const en=require("../locale/en.json")
const ar=require("../locale/ar.json")
const fr=require("../locale/fr.json")
const sp=require("../locale/sp.json")

const translations={en,sp,fr,ar}

function t(key,lang="en"){
    return translations[lang]?.[key]||translations.en[key]
}

module.exports=t
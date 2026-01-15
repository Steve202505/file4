const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');
const languages = ['ar', 'bn', 'en', 'fr', 'hi', 'km', 'ru', 'uk', 'ur', 'zh'];
const refLang = 'en';

const translations = {};

// Load all translations
languages.forEach(lang => {
    const filePath = path.join(localesDir, lang, 'translation.json');
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        try {
            translations[lang] = JSON.parse(content);
        } catch (e) {
            console.error(`Error parsing ${lang}:`, e.message);
        }
    } else {
        console.error(`Missing file for ${lang}`);
    }
});

const refKeys = Object.keys(translations[refLang]);
let hasErrors = false;

languages.forEach(lang => {
    if (lang === refLang) return;

    const langKeys = Object.keys(translations[lang]);
    const missing = refKeys.filter(k => !langKeys.includes(k));

    if (missing.length > 0) {
        console.log(`\nMissing keys in ${lang}:`);
        missing.forEach(k => console.log(`  - ${k}`));
        hasErrors = true;
    }
});

if (!hasErrors) {
    console.log('All languages have all keys present in English!');
}

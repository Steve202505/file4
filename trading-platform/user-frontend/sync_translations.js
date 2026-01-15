const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');
const languages = ['ar', 'bn', 'en', 'fr', 'hi', 'km', 'ru', 'uk', 'ur', 'zh'];
const enTemplatePath = path.join(localesDir, 'en', 'translation.json');

const enTranslation = JSON.parse(fs.readFileSync(enTemplatePath, 'utf8'));
const enKeys = Object.keys(enTranslation);

languages.forEach(lang => {
    const filePath = path.join(localesDir, lang, 'translation.json');
    if (!fs.existsSync(filePath)) return;

    let langData = {};
    try {
        // We read as string and parse to handle duplicates if any in original file
        const content = fs.readFileSync(filePath, 'utf8');
        langData = JSON.parse(content);
    } catch (e) {
        console.error(`Error parsing ${lang}:`, e.message);
        return;
    }

    const updatedData = {};
    enKeys.forEach(key => {
        // Keep existing translation if present, otherwise use English as fallback
        updatedData[key] = langData[key] || enTranslation[key];
    });

    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 4), 'utf8');
    console.log(`Updated ${lang} - ${enKeys.length} keys.`);
});

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const localesDir = path.join(__dirname, 'public', 'locales');
const enTemplatePath = path.join(localesDir, 'en', 'translation.json');

const enTranslation = JSON.parse(fs.readFileSync(enTemplatePath, 'utf8'));
const allKeys = new Set(Object.keys(enTranslation));
const foundStrings = new Set(); // To store all potential text strings

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walkDir(filePath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            analyzeFile(filePath);
        }
    });
}

function analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');

    // 1. Extract strings from JSX
    const jsxTextRegex = />([^<{}>]+)</g;
    let match;
    while ((match = jsxTextRegex.exec(content)) !== null) {
        const text = match[1].trim();
        if (text && text.length > 1 && !text.includes('{') && !text.includes('}')) {
            if (/[a-zA-Z]/.test(text)) foundStrings.add(text);
        }
    }

    // 2. Extract from attributes
    const attrRegex = /(?:placeholder|label|title|alt|message)\s*=\s*['"]([^'"]+)['"]/g;
    while ((match = attrRegex.exec(content)) !== null) {
        const val = match[1].trim();
        if (val && !val.startsWith('{')) foundStrings.add(val);
    }

    // 3. Extract strings in single/double quotes that look like words (Capitalized or multiple words)
    const quoteRegex = /['"]([A-Z][^'"]*|[^'"]+\s+[^'"]+)['"]/g;
    while ((match = quoteRegex.exec(content)) !== null) {
        const val = match[1].trim();
        if (val && val.length > 2 && !val.includes('/') && !val.includes('.') && !val.includes('_')) {
            if (/[a-zA-Z]/.test(val)) foundStrings.add(val);
        }
    }
}

walkDir(srcDir);

const newTranslations = {};
const existingValues = new Set(Object.values(enTranslation));

foundStrings.forEach(str => {
    if (!existingValues.has(str)) {
        // Generate a key from the string
        const key = str.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 50);
        if (key && !allKeys.has(key)) {
            newTranslations[key] = str;
        }
    }
});

fs.writeFileSync('deep_extracted_keys.json', JSON.stringify(newTranslations, null, 4));
console.log(`Found ${Object.keys(newTranslations).length} new potential translation items.`);

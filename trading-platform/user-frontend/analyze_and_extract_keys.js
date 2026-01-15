const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const localesDir = path.join(__dirname, 'public', 'locales');
const enTemplatePath = path.join(localesDir, 'en', 'translation.json');

const enTranslation = JSON.parse(fs.readFileSync(enTemplatePath, 'utf8'));
const allKeys = new Set(Object.keys(enTranslation));
const foundKeys = new Map(); // key -> defaultVal
const hardcodedStrings = new Set();

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

    // 1. Find t('key', 'default')
    const tRegex = /t\s*\(\s*['"]([^'"]+)['"]\s*(?:,\s*['"]([^'"]+)['"]\s*)?\)/g;
    let match;
    while ((match = tRegex.exec(content)) !== null) {
        const key = match[1];
        const defaultVal = match[2] || key;
        foundKeys.set(key, defaultVal);
    }

    // 2. Find JSX text patterns (very rough)
    // Looking for lines like <div>Some Text</div> or <span>Some Text</span>
    // but not inside <p>{t('key')}</p>
    const jsxTextRegex = />([^<{}>]+)</g;
    while ((match = jsxTextRegex.exec(content)) !== null) {
        const text = match[1].trim();
        if (text && text.length > 2 && !text.includes('{') && !text.includes('}')) {
            // Check if it's likely a sentence or word, not code
            if (/[a-zA-Z]/.test(text)) {
                hardcodedStrings.add(text);
            }
        }
    }

    // 3. Find attributes like placeholder="Enter text"
    const attrRegex = /(?:placeholder|label|title|alt)\s*=\s*['"]([^'"]+)['"]/g;
    while ((match = attrRegex.exec(content)) !== null) {
        const val = match[1].trim();
        if (val && !val.startsWith('{')) {
            hardcodedStrings.add(val);
        }
    }
}

walkDir(srcDir);

console.log('--- Found Translation Keys ---');
foundKeys.forEach((val, key) => {
    if (!allKeys.has(key)) {
        console.log(`[MISSING] ${key}: "${val}"`);
    }
});

console.log('\n--- Detected Hardcoded Strings ---');
const knownValues = new Set(Object.values(enTranslation));
hardcodedStrings.forEach(str => {
    if (!knownValues.has(str)) {
        console.log(`[HARDCODED] "${str}"`);
    }
});

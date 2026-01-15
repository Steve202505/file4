const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const enTranslationPath = path.join(__dirname, 'public', 'locales', 'en', 'translation.json');

const enTranslation = JSON.parse(fs.readFileSync(enTranslationPath, 'utf8'));
const existingKeys = Object.keys(enTranslation);
const existingValues = Object.values(enTranslation).map(v => v.toLowerCase());

const foundStrings = new Set();
const missingKeys = new Set();

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walk(filePath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            analyzeFile(filePath);
        }
    });
}

function analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');

    // 1. Find t('key', 'default') matches
    const tRegex = /t\s*\(\s*['"`]([^'"`]+)['"`](?:\s*,\s*['"`]([^'"`]*)['"`])?/g;
    let match;
    while ((match = tRegex.exec(content)) !== null) {
        const key = match[1];
        if (!existingKeys.includes(key)) {
            missingKeys.add(`${key} (Default: ${match[2] || 'N/A'})`);
        }
    }

    // 2. Find hardcoded strings in JSX (simplified)
    const jsxTextRegex = />([^<>{}\n\r]+)</g;
    while ((match = jsxTextRegex.exec(content)) !== null) {
        const text = match[1].trim();
        if (text && text.length > 1 && !/^[0-9\W_]+$/.test(text)) {
            if (!existingValues.includes(text.toLowerCase())) {
                foundStrings.add(text);
            }
        }
    }

    // 3. Find common attributes
    const attrRegex = /(?:placeholder|title|label|alt)\s*=\s*['"`]([^'"`{}]*)['"`]/g;
    while ((match = attrRegex.exec(content)) !== null) {
        const text = match[1].trim();
        if (text && text.length > 1 && !/^[0-9\W_]+$/.test(text)) {
            if (!existingValues.includes(text.toLowerCase())) {
                foundStrings.add(text);
            }
        }
    }
}

walk(srcDir);

const results = {
    missingKeysFromT: Array.from(missingKeys),
    potentialHardcodedStrings: Array.from(foundStrings).filter(s => {
        // Filter out common code-y things
        if (s.includes('=>')) return false;
        if (s.includes('${')) return false;
        if (s.length > 100) return false;
        return true;
    })
};

fs.writeFileSync('agent_analysis_results.json', JSON.stringify(results, null, 4));
console.log(`Found ${results.missingKeysFromT.length} missing keys from t() and ${results.potentialHardcodedStrings.length} potential hardcoded strings.`);

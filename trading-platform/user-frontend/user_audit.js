const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const enTranslationPath = path.join(__dirname, 'public', 'locales', 'en', 'translation.json');

const enTranslation = JSON.parse(fs.readFileSync(enTranslationPath, 'utf8'));
const existingKeys = Object.keys(enTranslation);
const existingValues = Object.values(enTranslation).map(v => v.toString().toLowerCase());

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
        if (!existingKeys.includes(key) && !key.includes('${')) {
            missingKeys.add(`${key} (Default: ${match[2] || 'N/A'})`);
        }
    }

    // 2. Find hardcoded strings in JSX
    const jsxTextRegex = />([^<>{}\n\r]+)</g;
    while ((match = jsxTextRegex.exec(content)) !== null) {
        const text = match[1].trim();
        if (text && text.length > 1 && !/^[0-9\W_]+$/.test(text) && !text.includes('i18n') && !text.includes('brand_name')) {
            if (!existingValues.includes(text.toLowerCase()) && !existingKeys.includes(text)) {
                foundStrings.add(JSON.stringify({ text, file: path.relative(srcDir, filePath) }));
            }
        }
    }

    // 3. Find string attributes (labels, titles, placeholders, messages, alt, name)
    const attrRegex = /(?:placeholder|title|label|alt|message|text|name|value|msg)\s*=\s*['"`]([^'"`{}]*)['"`]/g;
    while ((match = attrRegex.exec(content)) !== null) {
        const text = match[1].trim();
        if (text && text.length > 1 && !/^[0-9\W_]+$/.test(text) && !['checkbox', 'radio', 'text', 'password', 'number', 'email', 'tel', 'submit', 'reset', 'button'].includes(text.toLowerCase())) {
            if (!existingValues.includes(text.toLowerCase()) && !existingKeys.includes(text)) {
                foundStrings.add(JSON.stringify({ text, file: path.relative(srcDir, filePath) }));
            }
        }
    }

    // 4. Find toast/error messages in strings
    const toastRegex = /toast\.(?:error|success|info|warn)\s*\(\s*['"`]([^'"`#{}]+)['"`]/g;
    while ((match = toastRegex.exec(content)) !== null) {
        const text = match[1].trim();
        if (text && text.length > 3) {
            if (!existingValues.includes(text.toLowerCase()) && !existingKeys.includes(text)) {
                foundStrings.add(JSON.stringify({ text, type: 'toast', file: path.relative(srcDir, filePath) }));
            }
        }
    }
}

walk(srcDir);

const results = {
    missingKeysFromT: Array.from(missingKeys),
    findings: Array.from(foundStrings).map(s => JSON.parse(s))
};

fs.writeFileSync('user_audit_results.json', JSON.stringify(results, null, 4));
console.log(`Found ${results.missingKeysFromT.length} missing keys and ${results.findings.length} potential hardcoded items.`);

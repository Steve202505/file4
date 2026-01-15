const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const localesDir = path.join(__dirname, 'public', 'locales');
const enTemplatePath = path.join(localesDir, 'en', 'translation.json');

const enTranslation = JSON.parse(fs.readFileSync(enTemplatePath, 'utf8'));
const allKeys = new Set(Object.keys(enTranslation));
const existingValues = new Set(Object.values(enTranslation));

const foundNewItems = {};

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

    // Remove comments to reduce noise
    const cleanContent = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');

    // 1. Extract strings from JSX tags (e.g. <div>Text</div>)
    const jsxTextRegex = />\s*([^<{}>]+?)\s*</g;
    let match;
    while ((match = jsxTextRegex.exec(cleanContent)) !== null) {
        const text = match[1].trim();
        if (isValidText(text)) {
            addIfNew(text);
        }
    }

    // 2. Extract from attributes (placeholder, label, title)
    const attrRegex = /(?:placeholder|label|title|alt)\s*=\s*['"]([^'"]+)['"]/g;
    while ((match = attrRegex.exec(cleanContent)) !== null) {
        const val = match[1].trim();
        if (isValidText(val) && !val.startsWith('{')) {
            addIfNew(val);
        }
    }
}

function isValidText(text) {
    if (!text || text.length < 2) return false;
    // Exclude strings that look like:
    // - HTML/CSS class names (no spaces, hyphens, all lowercase)
    if (/^[a-z0-9\-]+$/.test(text) && !text.includes(' ')) return false;
    // - Class names like bi-x-lg
    if (text.startsWith('bi-')) return false;
    // - Code snippets
    if (text.includes('=>') || text.includes('const ') || text.includes('import ')) return false;
    // - Only numbers/symbols
    if (!/[a-zA-Z]/.test(text)) return false;

    return true;
}

function addIfNew(text) {
    if (!existingValues.has(text)) {
        const key = text.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 50);
        if (key && !allKeys.has(key)) {
            foundNewItems[key] = text;
        }
    }
}

walkDir(srcDir);

fs.writeFileSync('refined_missing_keys.json', JSON.stringify(foundNewItems, null, 4));
console.log(`Phase 2: Found ${Object.keys(foundNewItems).length} valid missing translation items.`);

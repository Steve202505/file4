const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');
const languages = ['ar', 'bn', 'fr', 'hi', 'km', 'ru', 'uk', 'ur', 'zh'];

const translations = {
    ar: {
        trade_win: "فوز في التداول",
        trade_loss: "خسارة في التداول",
        trade_profit: "ربح التداول"
    },
    bn: {
        trade_win: "ট্রেড জয়",
        trade_loss: "ট্রেড ক্ষতি",
        trade_profit: "ট্রেড লাভ"
    },
    fr: {
        trade_win: "Gain de Transaction",
        trade_loss: "Perte de Transaction",
        trade_profit: "Profit de Transaction"
    },
    hi: {
        trade_win: "ट्रेड जीत",
        trade_loss: "ट्रेड हानि",
        trade_profit: "ट्रेड लाभ"
    },
    km: {
        trade_win: "ឈ្នះការជួញដូរ",
        trade_loss: "ចាញ់ការជួញដូរ",
        trade_profit: "ប្រាក់ចំណេញពីការជួញដូរ"
    },
    ru: {
        trade_win: "Выигрыш в торговле",
        trade_loss: "Торговый убыток",
        trade_profit: "Торговая прибыль"
    },
    uk: {
        trade_win: "Виграш у торгівлі",
        trade_loss: "Торговий збиток",
        trade_profit: "Торговий прибуток"
    },
    ur: {
        trade_win: "ٹریڈ جیت",
        trade_loss: "ٹریڈ نقصان",
        trade_profit: "ٹریڈ منافع"
    },
    zh: {
        trade_win: "交易盈利",
        trade_loss: "交易亏损",
        trade_profit: "交易利润"
    }
};

languages.forEach(lang => {
    const filePath = path.join(localesDir, lang, 'translation.json');
    if (fs.existsSync(filePath)) {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const updates = translations[lang];

        Object.keys(updates).forEach(key => {
            content[key] = updates[key];
        });

        fs.writeFileSync(filePath, JSON.stringify(content, null, 4));
        console.log(`Updated ${lang} with financial translations.`);
    }
});

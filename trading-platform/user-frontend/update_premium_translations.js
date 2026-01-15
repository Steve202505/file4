const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');
const languages = ['ar', 'bn', 'fr', 'hi', 'km', 'ru', 'uk', 'ur', 'zh'];

const translations = {
    ar: {
        majestic: "مهيب",
        support_center: "مهيب",
        royal_agent_online: "الوكيل الملكي متصل",
        imperial_notice: "إشعار إمبراطوري",
        imperial_message: "إشعار إمبراطوري",
        claim_v_link: "استلام الرابط الموثق",
        return_to_throne: "العودة إلى العرش",
        done: "العودة إلى العرش",
        royal_encryption: "التشفير الملكي نشط",
        wallet_settings: "إعدادات المحفظة"
    },
    bn: {
        majestic: "রাজকীয়",
        support_center: "রাজকীয়",
        royal_agent_online: "রাজকীয় প্রতিনিধি অনলাইনে",
        imperial_notice: "রাজকীয় বিজ্ঞপ্তি",
        imperial_message: "রাজকীয় বিজ্ঞপ্তি",
        claim_v_link: "যাচাইকৃত লিঙ্ক দাবি করুন",
        return_to_throne: "সিংহাসনে ফিরে যান",
        done: "সিংহাসনে ফিরে যান",
        royal_encryption: "রাজকীয় এনক্রিপশন সক্রিয়",
        wallet_settings: "ওয়ালেট সেটিংস"
    },
    fr: {
        majestic: "MAJESTUEUX",
        support_center: "MAJESTUEUX",
        royal_agent_online: "AGENT ROYAL EN LIGNE",
        imperial_notice: "AVIS IMPÉRIAL",
        imperial_message: "AVIS IMPÉRIAL",
        claim_v_link: "RÉCLAMER LE LIEN VÉRIFIÉ",
        return_to_throne: "RETOUR AU TRÔNE",
        done: "RETOUR AU TRÔNE",
        royal_encryption: "CRYPTAGE ROYAL ACTIF",
        wallet_settings: "Paramètres du portefeuille"
    },
    hi: {
        majestic: "राजसी",
        support_center: "राजसी",
        royal_agent_online: "शाही एजेंट ऑनलाइन",
        imperial_notice: "शाही सूचना",
        imperial_message: "शाही सूचना",
        claim_v_link: "सत्यापित लिंक प्राप्त करें",
        return_to_throne: "सिंहासन पर लौटें",
        done: "सिंहासन पर लौटें",
        royal_encryption: "शाही एन्क्रिप्शन सक्रिय",
        wallet_settings: "वॉलेट सेटिंग्स"
    },
    km: {
        majestic: "ខ្ពង់ខ្ពស់",
        support_center: "ខ្ពង់ខ្ពស់",
        royal_agent_online: "ភ្នាក់ងាររាជវង្សអនឡាញ",
        imperial_notice: "ការជូនដំណឹងរបស់រាជវង្ស",
        imperial_message: "ការជូនដំណឹងរបស់រាជវង្ស",
        claim_v_link: "ទាមទារតំណដែលបានផ្ទៀងផ្ទាត់",
        return_to_throne: "ត្រឡប់ទៅបល្ល័ង្កវិញ",
        done: "ត្រឡប់ទៅបល្ល័ង្កវិញ",
        royal_encryption: "ការសម្ងាត់រាជវង្សសកម្ម",
        wallet_settings: "ការកំណត់កាបូប"
    },
    ru: {
        majestic: "ВЕЛИЧЕСТВЕННЫЙ",
        support_center: "ВЕЛИЧЕСТВЕННЫЙ",
        royal_agent_online: "КОРОЛЕВСКИЙ АГЕНТ ОНЛАЙН",
        imperial_notice: "ИМПЕРСКОЕ УВЕДОМЛЕНИЕ",
        imperial_message: "ИМПЕРСКОЕ УВЕДОМЛЕНИЕ",
        claim_v_link: "ПОЛУЧИТЬ ПРОВЕРЕННУЮ ССЫЛКУ",
        return_to_throne: "ВЕРНУТЬСЯ НА ТРОН",
        done: "ВЕРНУТЬСЯ НА ТРОН",
        royal_encryption: "КОРОЛЕВСКОЕ ШИФРОВАНИЕ АКТИВНО",
        wallet_settings: "Настройки кошелька"
    },
    uk: {
        majestic: "ВЕЛИЧНИЙ",
        support_center: "ВЕЛИЧНИЙ",
        royal_agent_online: "КОРОЛІВСЬКИЙ АГЕНТ ОНЛАЙН",
        imperial_notice: "ІМПЕРСЬКЕ ПОВІДОМЛЕННЯ",
        imperial_message: "ІМПЕРСЬКЕ ПОВІДОМЛЕННЯ",
        claim_v_link: "ОТРИМАТИ ПЕРЕВІРЕНЕ ПОСИЛАННЯ",
        return_to_throne: "ПОВЕРНУТИСЯ НА ТРОН",
        done: "ПОВЕРНУТИСЯ НА ТРОН",
        royal_encryption: "КОРОЛІВСЬКЕ ШИФРУВАННЯ АКТИВНЕ",
        wallet_settings: "Налаштування гаманця"
    },
    ur: {
        majestic: "پروقار",
        support_center: "پروقار",
        royal_agent_online: "شاہی ایجنٹ آن لائن",
        imperial_notice: "شاہی نوٹس",
        imperial_message: "شاہی نوٹس",
        claim_v_link: "تصدیق شدہ لنک حاصل کریں",
        return_to_throne: "تخت پر واپس جائیں",
        done: "تخت پر واپس جائیں",
        royal_encryption: "شاہی انکرپشن فعال ہے",
        wallet_settings: "والٹ کی ترتیبات"
    },
    zh: {
        majestic: "庄严",
        support_center: "庄严",
        royal_agent_online: "皇家代理在线",
        imperial_notice: "皇家通知",
        imperial_message: "皇家通知",
        claim_v_link: "领取验证链接",
        return_to_throne: "返回宝座",
        done: "返回宝座",
        royal_encryption: "皇家加密激活",
        wallet_settings: "钱包设置"
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
        console.log(`Updated ${lang} with premium translations.`);
    }
});

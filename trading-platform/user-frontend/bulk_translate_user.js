const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');
const languages = ['ar', 'bn', 'fr', 'hi', 'km', 'ru', 'uk', 'ur', 'zh'];

const translations = {
    ar: {
        "2fa_authentication": "مصادقة ثنائية العامل",
        "oldPassword": "كلمة المرور القديمة",
        "newPassword": "كلمة المرور الجديدة",
        "confirmPassword": "تأكيد كلمة المرور",
        "msg_profile_approval": "تتطلب تحديثات الملف الشخصي موافقة الوكيل. يرجى الاتصال بالدعم.",
        "all_caps": "الكل"
    },
    bn: {
        "2fa_authentication": "দ্বি-ফ্যাক্টর প্রমাণীকরণ",
        "oldPassword": "পুরানো পাসওয়ার্ড",
        "newPassword": "নতুন পাসওয়ার্ড",
        "confirmPassword": "পাসওয়ার্ড নিশ্চিত করুন",
        "msg_profile_approval": "প্রোফাইল আপডেটের জন্য এজেন্টের অনুমোদনের প্রয়োজন। অনুগ্রহ করে সহায়তার সাথে যোগাযোগ করুন।",
        "all_caps": "সব"
    },
    fr: {
        "2fa_authentication": "Authentification à deux facteurs",
        "oldPassword": "Ancien mot de passe",
        "newPassword": "Nouveau mot de passe",
        "confirmPassword": "Confirmer le mot de passe",
        "msg_profile_approval": "Les mises à jour du profil nécessitent l'approbation de l'agent. Veuillez contacter le support.",
        "all_caps": "TOUT"
    },
    hi: {
        "2fa_authentication": "द्वि-कारक प्रमाणीकरण",
        "oldPassword": "पुराना पासवर्ड",
        "newPassword": "नया पासवर्ड",
        "confirmPassword": "पासवर्ड की पुष्टि करें",
        "msg_profile_approval": "प्रोफ़ाइल अपडेट के लिए एजेंट की स्वीकृति आवश्यक है। कृपया समर्थन से संपर्क करें।",
        "all_caps": "सभी"
    },
    km: {
        "2fa_authentication": "ការផ្ទៀងផ្ទាត់កត្តាពីរ",
        "oldPassword": "ពាក្យសម្ងាត់ចាស់",
        "newPassword": "ពាក្យសម្ងាត់ថ្មី",
        "confirmPassword": "បញ្ជាក់ពាក្យសម្ងាត់",
        "msg_profile_approval": "ការធ្វើបច្ចុប្បន្នភាពកម្រងព័ត៌មានតម្រូវឱ្យមានការយល់ព្រមពីភ្នាក់ងារ។ សូមទាក់ទងផ្នែកគាំទ្រ។",
        "all_caps": "ទាំងអស់"
    },
    ru: {
        "2fa_authentication": "Двухфакторная аутентификация",
        "oldPassword": "Старый пароль",
        "newPassword": "Новый пароль",
        "confirmPassword": "Подтвердите пароль",
        "msg_profile_approval": "Обновление профиля требует одобрения агента. Пожалуйста, свяжитесь с поддержкой.",
        "all_caps": "ВСЕ"
    },
    uk: {
        "2fa_authentication": "Двофакторна автентифікація",
        "oldPassword": "Старий пароль",
        "newPassword": "Новий пароль",
        "confirmPassword": "Підтвердьте пароль",
        "msg_profile_approval": "Оновлення профілю потребує схвалення агента. Будь ласка, зверніться до служби підтримки.",
        "all_caps": "ВСЕ"
    },
    ur: {
        "2fa_authentication": "دو عنصر والا تصدیق",
        "oldPassword": "پرانا پاس ورڈ",
        "newPassword": "نیا پاس ورڈ",
        "confirmPassword": "پاس ورڈ کی تصدیق کریں",
        "msg_profile_approval": "پروفائل اپ ڈیٹ کے لیے ایجنٹ کی منظوری درکار ہے۔ براہ کرم سپورٹ سے رابطہ کریں۔",
        "all_caps": "تمام"
    },
    zh: {
        "2fa_authentication": "双因素认证",
        "oldPassword": "旧密码",
        "newPassword": "新密码",
        "confirmPassword": "确认密码",
        "msg_profile_approval": "资料更新需要代理批准。请联系客服。",
        "all_caps": "全部"
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
        console.log(`Updated ${lang} with user portal translations.`);
    }
});

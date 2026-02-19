# 🌍 Multi-Language Support Implementation Guide

## ✅ What's Been Set Up

### 1. **Installed Packages**
- `i18next` - Core internationalization framework
- `react-i18next` - React bindings for i18next
- `@react-native-async-storage/async-storage` - Persist language selection

### 2. **Translation Files Created**
Located in `src/locales/`:
- `en.json` - English translations
- `te.json` - Telugu translations (తెలుగు)
- `hi.json` - Hindi translations (हिंदी)

### 3. **i18n Configuration**
- File: `src/i18n.ts`
- Automatically loads saved language preference
- Persists language selection using AsyncStorage

### 4. **Components Created**
- `LanguageSelector.tsx` - Modal component for changing language

---

##  🚀 How to Use Translations in Your Screens

### Method 1: Using the `useTranslation` Hook (Recommended)

```tsx
import { useTranslation } from 'react-i18next';

export const MyScreen = () => {
    const { t } = useTranslation();
    
    return (
        <View>
            <Text>{t('students.title')}</Text>
            <Text>{t('students.searchPlaceholder')}</Text>
            <Button title={t('common.add')} />
        </View>
    );
};
```

### Method 2: Translation Keys Reference

Current translation structure:

```json
{
  "common": {
    "dashboard", "students", "rooms", "fees", "expenses",
    "income", "profile", "settings", "search", "add", "edit",
    "delete", "save", "cancel", "yes", "no", "loading"
  },
  "students": {
    "title", "addStudent", "active", "inactive",
    "searchPlaceholder", "room", "changeStatus"
  },
  "rooms": {
    "title", "addRoom", "beds", "available", "occupied"
  },
  "fees": {
    "title", "totalCollected", "totalPending", "amount"
  },
  "profile": {
    "title", "language", "selectLanguage", "changePassword"
  }
}
```

---

## 📝 Example: Update StudentsScreen with Translations

### Before:
```tsx
<Text style={styles.greeting}>All Students</Text>
<Text>Search by name or room...</Text>
<Text>Active</Text>
<Text>Inactive</Text>
```

### After:
```tsx
import { useTranslation } from 'react-i18next';

export const StudentsScreen = () => {
    const { t } = useTranslation();
    
    return (
        <>
            <Text style={styles.greeting}>{t('students.title')}</Text>
            <TextInput placeholder={t('students.searchPlaceholder')} />
            <Text>{t('students.active')}</Text>
            <Text>{t('students.inactive')}</Text>
        </>
    );
};
```

---

## 🔄 How to Change Language

###  Option 1: Use the LanguageSelector Component

```tsx
import { LanguageSelector } from '../components/LanguageSelector';

export const SettingsScreen = () => {
    return (
        <View>
            <LanguageSelector />
        </View>
    );
};
```

### Option 2: Change Language Programmatically

```tsx
import { changeLanguage } from '../i18n';

const handleLanguageChange = async () => {
    await changeLanguage('te'); // 'en', 'te', or 'hi'
};
```

---

## ➕ Adding New Translations

### 1. Add to Translation Files

Edit `src/locales/en.json`:
```json
{
  "students": {
    "deleteConfirm": "Are you sure you want to delete this student?"
  }
}
```

Edit `src/locales/te.json`:
```json
{
  "students": {
    "deleteConfirm": "మీరు ఖచ్చితంగా ఈ విద్యార్థిని తొలగించాలనుకుంటున్నారా?"
  }
}
```

Edit `src/locales/hi.json`:
```json
{
  "students": {
    "deleteConfirm": "क्या आप निश्चित रूप से इस छात्र को हटाना चाहते हैं?"
  }
}
```

### 2. Use in Your Component

```tsx
const { t } = useTranslation();

Alert.alert(
    t('common.delete'),
    t('students.deleteConfirm')
);
```

---

## 🎯 Available Languages

| Code | Language | Native Name |
|------|----------|-------------|
| `en` | English  | English     |
| `te` | Telugu   | తెలుగు      |
| `hi` | Hindi    | हिंदी       |

---

## 🔧 Adding More Languages

### 1. Create translation file: `src/locales/ta.json` (Tamil example)

```json
{
  "common": {
    "dashboard": "டாஷ்போர்டு",
    "students": "மாணவர்கள்"
  }
}
```

### 2. Update `src/i18n.ts`:

```tsx
import ta from './locales/ta.json';

const resources = {
  en: { translation: en },
  te: { translation: te },
  hi: { translation: hi },
  ta: { translation: ta }, // Add here
};

export const availableLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' }, // Add here
];
```

---

## ✅ Testing

1. Open the app
2. Go to Profile screen
3. Click on "Language" menu item
4. Select Telugu (తెలుగు) or Hindi (हिंदी)
5. Watch all text change automatically!

---

## 🎨 Current Implementation Status

✅ ProfileScreen - Already has language switching
✅ Translation files created for 3 languages
✅ i18n configuration complete
✅ Language persistence enabled
✅ LanguageSelector component ready

🔄 **Next Steps (You can do these):**
- Update StudentsScreen to use t('students.title')
- Update HomeScreen to use t('common.dashboard')
- Update RoomsScreen to use t('rooms.title')
- Update FeeManagementScreen to use t('fees.title')
- Update ExpenseScreen to use t('common.expenses')

---

## 📚 Quick Reference

```tsx
// Import hook
import { useTranslation } from 'react-i18next';

// Use in component
const { t, i18n } = useTranslation();

// Get translation
t('common.dashboard') // "Dashboard" or "డాష్‌బోర్డ్" or "डैशबोर्ड"

// Get current language
i18n.language // "en", "te", or "hi"

// Change language
await changeLanguage('te');
```

---

## 🐛 Troubleshooting

**Problem**: Text not changing when language changes
**Solution**: Make sure you're using `t('key')` instead of hardcoded strings

**Problem**: Missing translations
**Solution**: Check that the key exists in all three .json files

**Problem**: Language not persisting
**Solution**: Make sure `@react-native-async-storage/async-storage` is installed

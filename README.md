# HACCP-CMR Documentation Builder v2.0

## 📋 Áttekintés

Ez egy böngésző-alapú dokumentációs builder alkalmazás HACCP (Hazard Analysis Critical Control Points) rendszerek és CMR (Corrective and Preventive Action Records) kezeléshez. Az alkalmazás teljes mértékben a böngészőben fut, minden adat a localStorage-ban kerül tárolásra - nincs szükség backend szerverre.

## ✨ Főbb Funkciók

- **📄 Dokumentum készítés**: Blokk-alapú dokumentumok létrehozása és szerkesztése
- **👥 Ügyfélkezelés**: Ügyféladatok tárolása és dokumentumokhoz rendelése
- **🧱 Blokk sablonok**: Újrafelhasználható tartalom blokkok
- **📋 Sablonok**: Dokumentum sablonok gyors munkafolyamatokhoz
- **💾 Helyi tárolás**: Minden adat a böngésző localStorage-ában
- **📤 Export**: Word formátumba exportálás (hamarosan)
- **🔄 Mentés/Visszaállítás**: Teljes adatbázis backup és restore

## 🚀 Használat

### Telepítés

1. **Helyi használat**: Nyissa meg az `index.html` fájlt egy modern böngészőben (Chrome, Firefox, Safari, Edge)
2. **GitHub Pages**: Töltse fel a fájlokat GitHub repository-ba és engedélyezze a GitHub Pages-t

### Első lépések

1. **Új dokumentum létrehozása**:
   - Kattintson az "+ Új dokumentum" gombra a bal oldali menüben
   - Adja meg a dokumentum címét

2. **Blokkok hozzáadása**:
   - Váltson a "Blokkok" fülre
   - Kattintson egy blokkra a dokumentumhoz adáshoz
   - Vagy húzza át a blokkot a vászonra

3. **Ügyfél hozzárendelése**:
   - Először hozzon létre egy ügyfelet az "Ügyfelek" fülön
   - A dokumentum szerkesztőben válassza ki az ügyfelet a legördülő menüből

4. **Blokk szerkesztése**:
   - Vigye az egeret a blokk fölé
   - Kattintson a ✏️ ikonra a szerkesztéshez
   - Használja a rich text editort a tartalom formázásához

## 📁 Fájlstruktúra

```
HACCP-CMR/
├── index.html      # Fő HTML struktúra
├── style.css       # Styling és layout
├── app.js          # Alkalmazás logika
└── README.md       # Ez a fájl
```

## 🔧 Technológiai Stack

- **HTML5**: Markup struktúra
- **CSS3**: Modern styling (CSS Grid, Flexbox, Custom Properties)
- **Vanilla JavaScript (ES6+)**: Alkalmazás logika
- **Quill.js**: Rich text szerkesztés
- **docx.js**: Word export
- **FileSaver.js**: Fájl letöltés
- **SortableJS**: Drag & drop
- **localStorage**: Adattárolás

## 💾 Adattárolás

### Tárolási Stratégia

- **Dokumentumok**: Külön kulcs minden dokumentumnak (`haccp_cmr_document_doc_12345`)
- **Ügyfelek**: Egy kulcs az összes ügyfélnek (`haccp_cmr_clients`)
- **Sablonok**: Egy kulcs az összes sablonnak (`haccp_cmr_templates`)
- **Blokk csoportok**: Egy kulcs az összes csoportnak (`haccp_cmr_groups`)

### Tárolási Limit

A böngésző localStorage általában ~5-10MB kapacitást biztosít. Az alkalmazás optimalizálva van, de ajánlott:
- Maximum 50-100 dokumentum
- Maximum 5-10 kép dokumentumonként
- Képek max 800px szélesség, ~200KB méret

### Biztonsági Mentés

**FONTOS**: A localStorage adatok törlődhetnek, ha:
- Törli a böngésző cache-t
- Privát/inkognitó módot használ
- Eszközt visszaállít

**Megoldás**: Rendszeresen készítsen mentést a "💾 Mentés/Visszaállítás" funkcióval!

## 🎨 Testreszabás

### Színséma Módosítása

A `style.css` fájl elején található CSS változók módosításával:

```css
:root {
    --primary-color: #2563eb;      /* Fő szín */
    --secondary-color: #64748b;    /* Másodlagos szín */
    --background: #f8fafc;         /* Háttér */
    --surface: #ffffff;            /* Felület */
    --text-primary: #1e293b;       /* Szöveg */
    /* ... */
}
```

### Alapértelmezett Blokkok Módosítása

Az `app.js` fájlban a `groups` objektum módosításával.

## 🔒 Biztonság és Adatvédelem

### Előnyök
- ✅ **Maximum adatvédelem**: Az adatok soha nem hagyják el az eszközt
- ✅ **GDPR megfelelés**: Nincs adatgyűjtés
- ✅ **Offline működés**: Internet kapcsolat nélkül is használható

### Korlátozások
- ❌ **Nincs eszközök közötti szinkronizálás**: Az adatok csak egy böngészőben érhetők el
- ❌ **Nincs együttműködés**: Többfelhasználós szerkesztés nem támogatott
- ❌ **Korlátozott tárhely**: ~5-10MB limit

## 🛠️ Hibakeresés

### Gyakori Problémák

**Probléma**: A dokumentumok nem jelennek meg
- **Megoldás**: Nyomja meg F12-t, nézze meg a Console-t, ellenőrizze a localStorage-t (Application > Local Storage)

**Probléma**: "Nincs elég tárhely" hiba
- **Megoldás**: Készítsen mentést, törölje a régi dokumentumokat, vagy használja a "Minden törlése" funkciót

**Probléma**: A képek nem töltődnek be
- **Megoldás**: Használjon kisebb képeket (max 800px szélesség, ~200KB)

## 📱 Böngésző Kompatibilitás

### Támogatott Böngészők
- ✅ Chrome 60+ (2017+)
- ✅ Firefox 55+ (2017+)
- ✅ Safari 11+ (2017+)
- ✅ Edge 79+ (2020+)
- ✅ Opera 47+ (2017+)

### Nem Támogatott
- ❌ Internet Explorer (minden verzió)
- ❌ Régebbi mobil böngészők

## 🚀 Jövőbeli Fejlesztések

### Prioritás funkciók
- [ ] PDF Export
- [ ] Dokumentum keresés
- [ ] Tárhely kijelző
- [ ] Sötét mód
- [ ] Billentyű parancsikonok
- [ ] Kép tömörítés

### Fejlett funkciók
- [ ] IndexedDB migráció (nagyobb tárhely)
- [ ] Opcionális cloud sync
- [ ] Verziókövetés
- [ ] Együttműködés (backend szükséges)

## 📄 Licenc

Ez a projekt nyílt forráskódú és szabadon használható.

## 🤝 Közreműködés

Hibák jelentése, funkciókérések és pull requestek szívesen fogadottak a GitHub repository-ban.

## 📞 Támogatás

Problémák esetén:
1. Ellenőrizze ezt a dokumentációt
2. Nézze meg a böngésző Console-ját (F12)
3. Nyisson issue-t a GitHub-on

---

**Verzió**: 2.0.0  
**Utolsó frissítés**: 2024  
**Készítette**: HACCP-CMR Development Team

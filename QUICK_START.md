# ⚡ Quick Start Guide - HACCP-CMR Documentation Builder

## 🚀 Azonnali Indítás

### 1️⃣ Nyissa meg az alkalmazást
```
Dupla klikk az index.html fájlra VAGY
Húzza be a böngészőbe
```

### 2️⃣ Első dokumentum létrehozása
1. Kattintson az **"+ Új dokumentum"** gombra
2. Adja meg a dokumentum címét
3. (Opcionális) Válasszon ügyfelet

### 3️⃣ Tartalom hozzáadása
1. Váltson a **"🧱 Blokkok"** fülre
2. Kattintson egy blokkra (pl. "Bekezdés")
3. A blokk megjelenik a dokumentumban
4. Kattintson a ✏️ ikonra a szerkesztéshez

---

## 💡 5 Perces Tutorial

### Dokumentum Készítése

**Lépés 1: Ügyfél létrehozása**
```
1. Kattints: 👥 Ügyfelek fül
2. Kattints: + Új ügyfél
3. Töltsd ki: Cégnév, Email, Telefon (minimum)
4. Mentés
```

**Lépés 2: Dokumentum építése**
```
1. Kattints: 📄 Dokumentumok → + Új dokumentum
2. Cím: "HACCP Terv 2024"
3. Ügyfél: Válassz az előbb létrehozott ügyfélből
4. Blokkok hozzáadása:
   - Főcím (H1) → "HACCP Dokumentáció"
   - Bekezdés → "Cégnév: [ügyfél neve]"
   - Felsorolás → Kritikus pontok felsorolása
   - Kép → Kattints és válassz képet
```

**Lépés 3: Exportálás**
```
1. Kattints: 📄 Exportálás Word-be (header-ben)
2. A .docx fájl letöltődik
3. Nyisd meg Microsoft Word-ben
```

---

## ⌨️ Billentyűparancsok

| Parancs | Művelet |
|---------|---------|
| `Ctrl/Cmd + S` | Dokumentum mentése |
| `Ctrl/Cmd + N` | Új dokumentum létrehozása |
| `Ctrl/Cmd + E` | Export Word-be |

---

## 🎨 Blokk Típusok

### Alapértelmezett Blokkok
- **Főcím (H1)** - Nagy fejléc
- **Alcím (H2, H3)** - Kisebb fejlécek
- **Bekezdés** - Normál szöveg
- **Felsorolás** - Bullet pontok
- **Számozott lista** - 1, 2, 3...
- **Kép** - Képfeltöltés (max 2MB ajánlott)

### Egyedi Blokkok Létrehozása
```
1. Blokkok fül → ➕ Új csoport
2. Csoport neve: "Saját Blokkok"
3. ➕ ikon → Új blokk hozzáadása
4. Szerkesztés Quill editorral
5. Mentés
```

---

## 💾 Mentés & Biztonsági Mentés

### Automatikus Mentés
- ✅ Minden változtatás automatikusan mentésre kerül
- ✅ Adatok a böngésző localStorage-ában vannak
- ⚠️ **FONTOS**: Cache törléskor elvesznek!

### Biztonsági Mentés Készítése
```
1. Kattints: 💾 Mentés/Visszaállítás (header)
2. Kattints: Mentés letöltése
3. JSON fájl letöltődik
4. Tárold biztonságos helyen (Google Drive, stb.)
```

### Visszaállítás
```
1. 💾 Mentés/Visszaállítás
2. Válassz fájlt: [korábban mentett .json]
3. Visszaállítás gomb
4. Erősítsd meg
```

---

## 🔍 Keresés & Szűrés

### Dokumentumok Keresése
```
1. Dokumentumok fül
2. Keresőmező: 🔍 Keresés...
3. Írj be: dokumentum név VAGY ügyfél név
4. Real-time szűrés
```

---

## 📤 Export Opciók

### Word Export (.docx)
```
Funkciók:
✅ Címsorok megőrzése (H1, H2, H3)
✅ Formázás (bold, italic, underline)
✅ Listák (felsorolás, számozott)
✅ Ügyfél adatok automatikusan
✅ Dátumok
⚠️ Képek: placeholder (fejlesztés alatt)
```

**Tipp**: Exportálás után Word-ben finomhangolhatod a formázást.

---

## 🎯 Bevált Gyakorlatok

### 1. Rendszeres Mentés
```
📅 Heti 1x biztonsági mentés készítése
🔒 Mentés fájl tárolása cloud-ban
📁 Fájlnév: haccp-backup-YYYY-MM-DD.json
```

### 2. Sablonok Használata
```
✅ Gyakori dokumentum típusokból készíts sablont
✅ Sablon név: "HACCP Sablon 2024"
✅ Új dokumentumhoz: sablon alkalmazása
```

### 3. Ügyfél Adatbázis
```
✅ Minden ügyfél teljes adatai (11 mező)
✅ Megjegyzések mező: speciális követelmények
✅ Rendszeres frissítés
```

### 4. Képoptimalizálás
```
⚠️ Max 2MB / kép
✅ Előtte resize 800px szélesség
✅ JPEG formátum preferált
🛠️ Tool: TinyPNG, Squoosh
```

---

## ❓ Gyakori Problémák

### "Nincs elég tárhely"
```
Megoldás:
1. 💾 Biztonsági mentés készítése
2. Régi dokumentumok törlése
3. Képek optimalizálása
4. VAGY: Minden törlése → Visszaállítás
```

### "Dokumentum nem jelenik meg"
```
1. F12 → Console ellenőrzése
2. Application → localStorage ellenőrzése
3. Oldal újratöltése (F5)
4. Szükség esetén: cache törlése
```

### "Export nem működik"
```
1. Ellenőrizd: van-e tartalom a dokumentumban
2. Ellenőrizd: console errort (F12)
3. Próbáld böngésző privát módban
4. CDN library loadingot ellenőrizd (Network tab)
```

---

## 📱 Mobilhasználat

### Támogatott
- ✅ Dokumentumok megtekintése
- ✅ Szerkesztés
- ✅ Ügyfélkezelés

### Korlátozások
- ⚠️ Drag & drop korlátozott
- ⚠️ Quill editor kisebb képernyőn
- 💡 Desktop használat ajánlott

---

## 🆘 Segítség & Támogatás

### Hiba jelentés
1. F12 → Console
2. Screenshot készítése
3. Issue nyitása GitHub-on
4. Error message csatolása

### További dokumentáció
- 📖 README.md - Teljes dokumentáció
- 📋 CHANGELOG.md - Változások listája
- 💻 architecture-local.json - Technikai részletek
- 🗺️ development-roadmap-local.json - Fejlesztési terv

---

## ✅ Checklist - Első használat

- [ ] index.html megnyitva böngészőben
- [ ] Első dokumentum létrehozva
- [ ] Ügyfél hozzáadva
- [ ] Blokkok kipróbálva
- [ ] Kép feltöltve
- [ ] Word export tesztelve
- [ ] Biztonsági mentés készítve
- [ ] Billentyűparancsok kipróbálva

---

**🎉 Gratulálunk! Készen állsz a HACCP dokumentáció készítésére!**

**Verzió**: 2.0.0  
**Utolsó frissítés**: 2024-12-29

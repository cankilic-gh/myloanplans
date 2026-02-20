# MyLoanPlans - Upgrade Plan

**Analiz Tarihi:** 2026-02-16
**Tip:** Next.js 16 + React 19 + TypeScript + Prisma + Supabase

---

## Kritik Upgrades

### 1. Auth Katmani Birlestirme
**Oncelik:** KRITIK
**Dosyalar:** `DashboardLayout.tsx`, NextAuth config

NextAuth v5 + sessionStorage hibrit kullaniliyor. Tek katmana gecmeli.

**Gorev:**
- [ ] Sadece `useSession()` hook'u kullan
- [ ] sessionStorage auth kontrollerini kaldir
- [ ] NextAuth callback'lerinde session set et

---

### 2. State Management Tutarliligi
**Oncelik:** KRITIK
**Dosyalar:** `LoanTab.tsx`, `lib/storage.ts`

SavedPlanData tipi iki yerde tanimli. Map JSON donusumu her yerde tekrar.

**Gorev:**
- [ ] Zustand store genislet (Loan + Budget)
- [ ] Map yerine plain object kullan
- [ ] Tek tip kaynagi olustur

---

## Yuksek Oncelikli Upgrades

### 3. Console.log Temizligi
**Oncelik:** YUKSEK
**Dosya:** `components/budget/Chart.tsx`

Production'da 4 adet console.log kalmis.

**Gorev:**
- [ ] Debug log'larini kaldir
- [ ] Ortam degiskenine bagli debug sistemi kur (opsiyonel)

---

### 4. Amortizasyon Tablosu Performansi
**Oncelik:** YUKSEK

360 satir + Framer Motion animasyonu = yavas.

```bash
npm install @tanstack/react-virtual
```

**Gorev:**
- [ ] Virtual scroll implement et
- [ ] Animasyonu sadece gorunur satirlara uygula

---

### 5. Test Coverage
**Oncelik:** YUKSEK

```bash
npm install -D vitest @testing-library/react
```

**Gorev:**
- [ ] `mortgageMath.ts` icin unit test yaz
- [ ] API route'lar icin integration test

---

## Orta Oncelikli Upgrades

### 6. Kredi Turu Cesitlendirme
**Oncelik:** ORTA
**Dosya:** `utils/mortgageMath.ts`

Sadece mortgage formulu var.

**Gorev:**
- [ ] LoanType enum olustur
- [ ] Otomobil kredisi formulu ekle
- [ ] Balon odeme destegi
- [ ] Grace period destegi

---

### 7. Grafik Cesitlendirme
**Oncelik:** ORTA

Sadece BarChart var.

**Gorev:**
- [ ] LineChart ile bakiye erimesi grafigi
- [ ] PieChart ile kategori dagilimi (budget)

---

### 8. Plan Karsilastirma Modu
**Oncelik:** ORTA

Planlar yanyana karsilastirilemiyor.

**Gorev:**
- [ ] Side-by-side karsilastirma UI
- [ ] "Plan A vs Plan B" senaryosu

---

### 9. E-posta Dogrulama Persist
**Oncelik:** ORTA
**Dosya:** `lib/verification-codes.ts`

Kodlar bellekte tutuluyor, server restart'ta kaybolur.

**Gorev:**
- [ ] VerificationToken Prisma modeli olustur
- [ ] Kodlari DB'de sakla

---

## Dusuk Oncelikli Upgrades

### 10. SEO Metadata
**Oncelik:** DUSUK

Alt sayfalarda ayri metadata yok.

**Gorev:**
- [ ] /dashboard icin metadata export et
- [ ] /calculator icin generateMetadata()
- [ ] Dinamik sayfa title'lari

---

## Onerilen Teknolojiler

| Kategori | Kutuphane | Amac |
|----------|-----------|------|
| Virtual List | `@tanstack/react-virtual` | Tablo performansi |
| Grafik | Recharts LineChart + PieChart | Daha fazla gorsel |
| Test | Vitest + Testing Library | Unit/Integration test |
| Form | React Hook Form + Zod | Validation |
| PDF | `@react-pdf/renderer` | Amortizasyon PDF export |
| Currency | Intl API | Multi-currency destegi |

---

## Tahmini Is Yukleri

| Upgrade | Zorluk |
|---------|--------|
| Auth Birlestirme | Orta |
| State Tutarliligi | Orta |
| Virtual Scroll | Kolay |
| Kredi Turleri | Orta |
| Test Ekleme | Orta |

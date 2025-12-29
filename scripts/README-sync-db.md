# Veritabanı Senkronizasyonu

Local veritabanındaki verileri production (Vercel) veritabanına aktarmak için:

## 1. Local Veritabanından Export (Tamamlandı ✅)

```bash
node scripts/export-local-db.js
```

Bu komut `local-db-export.json` dosyası oluşturur.

## 2. Production Veritabanına Import

### Seçenek A: Vercel Dashboard'dan Environment Variables'ı Al

1. Vercel Dashboard → Projen → Settings → Environment Variables
2. `DATABASE_URL` ve `DIRECT_URL` değerlerini kopyala
3. Local'de geçici olarak ayarla:

```bash
export DATABASE_URL="your-production-database-url"
export DIRECT_URL="your-production-direct-url"
node scripts/import-to-production.js
```

### Seçenek B: Vercel CLI ile

```bash
# Vercel CLI ile environment variables'ı al
vercel env pull .env.production

# Production URL'leri kullanarak import et
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2) \
DIRECT_URL=$(grep DIRECT_URL .env.production | cut -d '=' -f2) \
node scripts/import-to-production.js
```

## ⚠️ DİKKAT

- Import script'i mevcut production verilerini **SİLER** ve local verileri import eder
- Önce production veritabanını yedeklemek isteyebilirsin
- Import işlemi geri alınamaz!

## Export Edilen Veriler

- Users: 3
- Loan Plans: 5
- Budget Accounts: 0
- Budget Categories: 2
- Transactions: 0
- Recurring Expenses: 3


# GITAR-AKOR (React + Vite + Supabase)

Bu proje tek uygulama mantığında ilerler: **frontend (React/Vite)** + **Supabase SQL şeması**.
Ayrı bir backend servisi yok; scraping ve yönetim işleri doğrudan **Admin Panel** üzerinden Supabase Edge Function çağrısı ile yapılır.

## Klasör yapısı
- `frontend/`: React + Vite + Tailwind uygulaması
- `docs/supabase-schema.sql`: veritabanı, index, trigger ve RLS tanımları

## Kurulum
1. SQL Editor içinde `docs/supabase-schema.sql` dosyasını çalıştırın.
2. `frontend/.env` oluşturun:
   - `VITE_SUPABASE_URL=...`
   - `VITE_SUPABASE_ANON_KEY=...`
3. Frontend başlatın:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Admin Panel
- Giriş: `admin` / `19871987` (hardcoded)
- Özellikler:
  - URL verip `scrape-chord-page` Supabase Edge Function'ını tetikleme
  - Hızlı örnek şarkı/akor kaydı ekleme

> Not: Scraping işlemini yapan asıl kodu Supabase Edge Function içinde tutmanız önerilir.

# GITAR-AKOR başlangıç mimarisi

## Klasör yapısı
- `frontend/`: React + Vite + Tailwind tarafı
- `backend/scraper/`: Node.js scraping scriptleri
- `supabase/` ve `docs/supabase-schema.sql`: veritabanı ve RLS DDL

## Başlangıç adımları
1. Supabase SQL Editor'da `docs/supabase-schema.sql` dosyasını çalıştırın.
2. Frontend `.env` içerisine:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Backend `.env` içerisine:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Scrape örneği:
   ```bash
   node backend/scraper/scrapeAndInsert.js "https://ornek-site/sarki"
   ```

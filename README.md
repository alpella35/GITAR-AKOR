# GITAR-AKOR (React + Vite + Supabase)

Bu proje tek uygulama mantığında ilerler: **frontend (React/Vite)** + **Supabase SQL şeması**.
Ayrı bir backend servisi yok; scraping ve yönetim işleri **Admin Panel** + **Supabase Edge Function** ile yapılır.

## Klasör yapısı
- `frontend/`: React + Vite + Tailwind uygulaması
- `docs/supabase-schema.sql`: veritabanı, index, trigger ve RLS tanımları
- `supabase/functions/scrape-chord-page/index.ts`: scraping + DB insert edge function

## Kurulum
1. SQL Editor içinde `docs/supabase-schema.sql` dosyasını çalıştırın.
2. Edge Function secret ekleyin:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Function deploy edin:
   ```bash
   supabase functions deploy scrape-chord-page --no-verify-jwt
   ```
4. `frontend/.env` oluşturun:
   - `VITE_SUPABASE_URL=...`
   - `VITE_SUPABASE_ANON_KEY=...`
5. Frontend başlatın:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## “Failed to send a request to the Edge Function” için hızlı çözüm
Admin panelde **Function Health Check** butonuna basın ve çıkan mesaja göre ilerleyin:
- `FunctionsFetchError`: endpointe erişilemiyor (yanlış URL/project ref/deploy yok)
- `FunctionsHttpError`: function çalıştı ama içeride hata verdi (Functions logs)
- `FunctionsRelayError`: function adı/auth/relay sorunu

Ek CLI kontrolü:
```bash
supabase functions list
supabase functions logs scrape-chord-page
```

## Admin Panel
- Giriş: `admin` / `19871987` (hardcoded)
- Özellikler:
  - Function Health Check
  - URL verip `scrape-chord-page` çağırma
  - Hızlı örnek şarkı/akor kaydı ekleme

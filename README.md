# GITAR-AKOR (React + Vite + Supabase)

Bu proje tek uygulama mantığında ilerler: **frontend (React/Vite)** + **Supabase SQL şeması**.
Ayrı bir backend servisi yok; scraping ve yönetim işleri **Admin Panel** + **Supabase Edge Function** ile yapılır.

## Kurulum
1. SQL Editor içinde `docs/supabase-schema.sql` dosyasını çalıştırın.
2. Edge Function secret ekleyin: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy:
   ```bash
   supabase functions deploy scrape-chord-page --no-verify-jwt
   ```
4. `frontend/.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
5. `cd frontend && npm install && npm run dev`

## HealthCheck 400 (`Unexpected end of JSON input`) kesin çözüm
Bu hata genelde boş veya whitespace body parse edilirken çıkar.
Function artık:
- boş body'yi `{}` kabul eder,
- bozuk JSON varsa `Geçersiz JSON body` döner.

Yine de aynı hatayı görüyorsanız **eski deployment çalışıyordur**. Zorunlu olarak yeniden deploy edin:
```bash
supabase functions deploy scrape-chord-page --no-verify-jwt
supabase functions list
supabase functions logs scrape-chord-page
```

## Admin Panel
- Giriş: `admin` / `19871987`
- Health Check
- URL scrape + kayıt
- Örnek veri ekleme

## 2026-10-19

### FE-03 — CEO Dashboard boshlang'ich tuzilmasi

- **Mas'ul:** Mirobid
- **Holat:** DONE
- CEO panelining boshlang'ich tuzilmasi va sahifa/marshrutlari mavjud.
- Build muvaffaqiyatli; 11 marshrut runtime'da tekshirilgani `task.md`da qayd etilgan.
- API bog'liqliklari `mars-ceo/docs/CEO-DASHBOARD.md`da hujjatlashtirilgan.
- Mirobid Team Lead taqsimotni tasdiqlagani va Backend bilan API kelishilgani haqida
  tasdiq berdi.
- Taqsimot: Overview/Profile/Login va Financial — Mirobid; Attendance/Homework va
  ro'yxat sahifalari — frontend jamoasi. Guruhlangan sahifalarning aniq engineer
  nomlari berilmagan va taxmin qilinmagan.
- FE-04 hozir **BLOCKED**: grafiklar uchun haqiqiy ma'lumot doimiy bazaga
  kiritilmaguncha ijobiy ssenariyni tekshirib bo'lmaydi. Ma'lumotlar qo'shilmagan.

### FE-05 — Talaba frontend ishini ko'rib chiqish

- **Mas'ul:** Mirobid
- **Holat:** DONE (review vazifasi; topilgan tuzatishlar ochiq)
- Student login tokensiz, himoyalangan `GET /admins` endpointiga murojaat qiladi;
  Admin modelida parol select qilinmaydi va JSON javobidan chiqariladi. Endpoint
  tekshiruvi `401 Missing bearer token` qaytardi.
- Login mock token yaratadi; u backend JWT autentifikatsiyasidan o'tmaydi.
- Panel marshrutlari admin/mentor/branch/group/student ro'yxatlari, login esa
  "Admin panel" deb belgilangan. Talaba panelining tasdiqlangan scope'i noma'lum.
- `entities.js`dagi `implemented: false` flaglari mavjud backend endpointlariga
  mos emas.
- Review natijalari va ochiq follow-up tuzatishlar `task.md`dagi FE-05 bo'limida
  qayd etildi; tuzatishlar uchun mas'ullar belgilanmagan.
- `mars-student` build tekshiruvi Vite dependency yo'qligi sababli bajarilmadi.

### TEAM-03 — Hujjatlarni yuritish

- **Mas'ul:** Mirobid
- **Holat:** DONE
- `knowledge.md`dagi vazifalar fayliga tegishli to'rtta eskirgan `tasks.md` havolasi
  haqiqiy `task.md` fayl nomiga tuzatildi.
- Jamoa rollari yoki umumiy jarayon bo'yicha tasdiqlangan yangi ma'lumot
  bo'lmagani uchun taxminiy o'zgarish qo'shilmadi.
- FE-03, FE-04, FE-05 va TEAM-03 holatlari hamda tegishli natijalar `task.md` va
  `done.md`da yangilandi.
## 2026-10-20

### FE-03 — CEO Dashboard tuzilmasi (kengaytirilgan)

- **Mas'ul:** Mirobid
- **Holat:** DONE (yangilama)
- Guard tizimi to'ldirildi: `routes/ErrorBoundary.jsx` (app va page variantlari) qo'shildi,
  `NotFound` himoyalangan qismga catch-all sifatida ulandi, `ProtectedRoute` esa
  `ErrorBoundary` ichida joylashtirildi. Noma'lum manzillar shell ichida 404 ko'rsatadi,
  token yo'q bo'lsa `/login`ga yo'naltiriladi, render xatolari (jumladan lazy chunk
  yuklanmasligi) ushlanadi va marshrut bo'yicha avtomatik tiklanadi.
- To'rtta real xato topilib tuzatildi:
  1. `Sidebar.jsx` lucide ikonlarni `{item.icon}` sifatida render qilgan (React #31) —
     barcha sahifalar "Kutilmagan xatolik" ekraniga tushgan; ikon endi `<Icon />` sifatida,
     `isComponentType` yordamida render qilinadi, `framer-motion` importi `motion/react`ga
     o'tkazildi.
  2. `ProtectedRoute` `meStatus === 'loading'` holatida bolalarni unmount qilgan — `Profile`
     qayta mount bo'lib yana `fetchMe` so'ragan va cheksiz so'rov sikli hosil qilgan;
     endi ekran mounted qoladi.
  3. `condition` bilan bekor qilingan `fetchMe` so'rovi `rejected` bo'lib `meStatus='failed'`
     qilgan; `action.meta?.condition` tekshiruvi qo'shildi.
  4. Global rate limit (300/15 daqiqa) testlar tomonidan tugatilgan — `.env`da
     `RATE_LIMIT_MAX=20000` (faqat dev uchun).
- Global dizayn tizimi: `src/index.css`da daisyUI ichki temalari o'chirilib, brend palitrasiga
  mos `winter` (yorug') va `night` (to'q) custom temalari yaratildi. Mars Olovrang
  `#f44516` — primary; barcha ikonlar (lucide SVG) oddiy qora (`--color-base-content`).
  `Sidebar.jsx` va `Login.jsx`dagi hardkod `#f44516` olib tashlandi, grafikalar
  `useChartColors` orqali temadan o'qiadi.
- Logotip: `components/ui/MarsLogo.jsx` yangilandi — geometrik kichik harfli `mars°`
  wordmark (Poppins 600) + to'q sariq brend halqasi; `public/favicon.svg`,
  `mars-logo.svg`, `mars-logo-white.svg` yangilandi. Logotipning kichik harfli
  `mars°` ko'rinishi Mirobid tomonidan tasdiqlandi.

### FE-04 — 12-muammo: Students Count by Course (bajarildi)

- **Mas'ul:** Mirobid
- **Holat:** 12-muammo DONE; FE-04 ning umumiy ro'yxat sahifalaridagi filtr va
  pagination ishi ochiq qoladi.
- Manba: `Downloads/Telegram Desktop/message.txt` (Backend + Frontend Specification, MVP).
- Backend (`mars-backend`, branch `feat/intern-api`): `GET /students/report` —
  `search`, `branch`, `course` (ko'p, AND), `studentStatus`, `page`, `limit`.
  `src/services/studentsReport.service.js` hisob mantiqini bajaradi, Swagger hujjati
  yangilandi (116 path).
- Yangi entity yaratilmadi: mavjud `students`, `courses`, `groups`, `enrollment`,
  `branch` modellari qo'llanildi. O'quvchi↔kurs bog'lanishi `enrollment` (kurs tarixi) va
  `group` (joriy guruh) dan yig'iladi; har bir o'quvchi har bir yo'nalishda distinct
  hisoblanadi. O'quvchi holati (`isActive`/`isFrozen`) va kurs holati
  (`enrollment.status`) alohida saqlanadi.
- Branch scope `utils/scope.js` orqali serverda tekshiriladi (fail-closed) — BM/Admin
  boshqa filial ma'lumotini ololmaydi.
- Frontend (`mars-ceo`): `src/pages/StudentsReport.jsx` — statistika kartalari
  (Total/Active/Frozen/Archived, bosilsa status filtrini o'zgartiradi), yo'nalishlar
  bo'yicha hisob jadvali (bosilsa kurs filtriga qo'shiladi), filtrlar (Search, Branch,
  Course ko'p tanlovli AND bilan, Student Status), o'quvchilar jadvali (№, Name, Age,
  Course, Branch, Status), pagination va o'quvchi profili modal oynasi;
  `src/features/report/studentsReportSlice.js` Redux slice, nav, route va store reduceri
  ulandi.
- QA: `npm run test:students-report` — **27 passed, 0 failed** (spec §5 ssenariylari va
  §9 qabul mezonlari). Runtime (Playwright, dev va production build): 13/13 marshrut,
  0 page error.
- Demo ma'lumot: `scripts/lms-fixtures.js` — 3 filial, 4 kurs, 10 guruh, 12 o'quvchi,
  17 enrollment; har bir hisob qoidasi uchun maxsus holatlar bilan.

### Dev muhiti va hujjatlar

- **Mas'ul:** Mirobid
- **Holat:** DONE
- `mars-backend/scripts/dev-server.js` — bitta process'da in-memory MongoDB + CEO/LMS seed +
  API (avvalgi `nodemon` qatlami olib tashlandi, ortiqcha child process'lar yo'qoldi).
- `mars-backend/.env` — `MONGO_URI`, `JWT_SECRET`, `PORT`, `CEO_EMAIL`, `CEO_PASSWORD`;
  `.env` `.gitignore`da, repo'ga kirmadi.
- Hujjatlar: `mars-ceo/docs/PROBLEM-12-STUDENTS-REPORT.md` (12-muammo to'liq hujjati),
  `mars-ceo/docs/CEO-DASHBOARD.md` (14-sahifa qo'shildi), `mars-ceo/README.md`
  (guard jadvali va dizayn tizimi qo'shildi), `task.md` (FE-04 Natija bloki).
- Kunlik hisobot: `2026-10-22-ISHLAR/` papkasi (21 fayl) va Telegram uchun
  `Desktop/MARS-bugungi-hisobot-2026-10-22.txt`.
- Commit va push: `LMS-JAMOL/mars-ceo` (yangi repo, `main`), `nF-2781/mars-backend`
  (`feat/intern-api`), `nF-2781/mars-team` (workspace) va qolgan 10 panel brend commitlari
  bilan yangilandi. `mars-student`da jamoa o'z ishini qilgan edi — ularning ishi ustiga
  yozilmadi, lokal jamoa versiyasiga sinxronlandi, brend ishi `backup/local-branding`
  branch'ida saqlangan.

## 2026-10-21

### BP-12 — Students Count by Course (12-muammo)

- **Mas'ul:** Mirobid (frontend), jamoa (backend)
- **Holat:** DONE
- CEO panelida `/students-report` sahifasi qurildi: statistika kartalari, yo'nalishlar
  bo'yicha hisob jadvali, Search / Branch / Course (ko'p, AND) / Student Status
  filtrlari, o'quvchilar jadvali, o'quvchi profili va o'qish tarixi.
- Backend jamoaning o'z implementatsiyasiga moslashdi (`GET /students/report/stats`,
  `/students`, `/students/:id` — `LMS-JAMOL/MARS-backend` `main` branchida).
- Backend kamchiligi tuzatildi: `byCourse` har bir kursni ikki marta qaytarardi
  (guruhlash link obyekti bo'yicha edi) — endi bir qator va to'g'ri unikal son.
- O'quvchi holati (`isActive`/`isFrozen`) va kurs holati (`enrollment.status`) alohida
  saqlanadi: kursni tugatgan o'quvchi umumiy hisobda faol qoladi.
- Tuzatish, jamoaning testi va dev infratuzilmasi `feat/dev-server-and-lms-seed`
  branchida (`nF-2781/mars-backend`): `npm run dev:memory`, LMS seed fixture'lari,
  `lastLoginAt` `/ceo/me` da, login rate limit sozlanadigan.
- Tekshiruv: jamoaning 53 ta Student Report testi yashil, runtime 13/13 marshrut, 0 xato.
- Hujjat: `mars-ceo/docs/PROBLEM-12-STUDENTS-REPORT.md`.

## 2026-10-22

### BP-06 — Mentor davomatni belgilay olmasligi (11-muammo)

- **Mas'ul:** Mirobid (frontend), jamoa (backend)
- **Holat:** DONE
- `mars-mentor` paneli avval admin panelining nusxasi edi (3 fayl / 7 qator farq): mock
  login, admin navigatsiyasi, davomat funksiyasi umuman yo'q. Endi haqiqiy mentor
  autentifikatsiyasi (`POST /mentors/login` — email yoki telefon), mentor scope va
  Dashboard / Davomat / Guruhlarim / O'quvchilar / Profile sahifalari bor.
- Davomat oqimi PM yechimidagi ketma-ketlikka to'liq mos: guruh → dars (ixtiyoriy) →
  o'quvchilar ro'yxati → «Keldi / Kelmadi» → Saqlash → tasdiq; xatolikda xabar va qayta
  urinish; sahifa qayta ochilganda saqlangan belgilar tiklanadi.
- Qoidalar: mentor faqat o'z guruhi (server-side 403), faqat bugungi sana (400),
  belgilanmagan o'quvchi «Kelmadi» deb hisoblanmaydi — UI belgilanmaganlar sonini ko'rsatadi.
- Backend tuzatilgan: `present` belgisiz yozuv "kelgan" deb hisoblanmasdi (mentorga to'lov
  puli xavfi) va bir dars uchun ikki marta saqlash mumkin edi (mentor ikki marta
  to'lanardi) — endi `(group, lessonSession)` unique va takror saqlash 409 beradi.
- Mentor login limiteri endi `RATE_LIMIT_LOGIN_MAX` orqali sozlanadi (dev uchun 200).
- Panel mars-ceo bilan bir xil stackda: React 19, Redux Toolkit + redux-persist, motion,
  lucide, react-toastify, Tailwind v4 + daisyUI (MARS temalari, brend sariq
  `rgb(244, 69, 22)`, oddiy qora ikonlar, "mars°" wordmark) + guard tizimi
  (ProtectedRoute, ErrorBoundary, NotFound).
- Seed'da mentor (`mentor@mars.uz` / `Mentor123`) va unga biriktirilgan guruhlar bor.
- Tekshiruv: jamoaning 255 ta backend testi yashil; runtime login → guruh → o'quvchilar →
  belgilash → saqlash (201) → qayta ochilganda tiklash, 0 page error.

### FE-04 - CEO panelida o'quvchilar guruh ichida (Guruhlar sahifasi)

- **Mas'ul:** Mirobid
- **Holat:** DONE (qisman - FE-04 ning qolgan qismi ochiq)
- CEO panelidagi alohida "Students" sahifasi olib tashlandi: o'quvchilar endi o'z
  guruhi orqali ko'rinadi (foydalanuvchi talabi - "Students page kerak emas").
- `/groups` sahifasi qurildi: tepada qidiruv maydoni - ism, familiya yoki guruh nomi
  bo'yicha; guruhlar kartalar ko'rinishida, har bir kartada filial, kurs, o'quvchi
  soni va birinchi 4 ta o'quvchi nomi.
- `/group/:groupId` sahifasi qurildi: guruh sarlavhasi (filial, kurs, mentor),
  o'quvchilar soni kartasi, o'quvchilar jadvali (ism, telefon, yosh) va ichki qidiruv.
- `config/nav.js` dan "Students" elementi va `App.jsx` dan `/students` marshruti
  olib tashlandi; eski `/groups` EntityView marshruti bilan takrorlanish tuzatildi.
- Backend `GET /groups` va `GET /groups/:id` javobiga `course` populate qo'shildi
  (guruh kursini ko'rsatish uchun).
- Tekshiruv: `npm run build` muvaffaqiyatli; runtime'da CEO login - Guruhlar -
  qidiruv (ism/familiya/guruh nomi) - guruh ichiga o'tish tekshirildi:
  9 guruh / 15 o'quvchi, "Ali" 4 guruh, "Valiyev" 2 guruh, guruh ichida to'liq
  ro'yxat, 0 page error.
- Lokal commit: `mars-ceo` `84c3012` (feat(groups): move the students inside the groups).

### OPS-02 - Panellarga kirish uchun login ma'lumotlari

- **Mas'ul:** Mirobid
- **Holat:** DONE
- Sabab: `npm run dev` **haqiqiy** MongoDB'ga (`mongodb://localhost:27017/mars-lms`)
  ulangan holda ishlayapti, lekin shu bazada faqat eski `ceo@mars.test` hisobi bor
  edi; demo ma'lumotlar (3 filial, 3 kurs, 9 guruh, 12 o'quvchi, 17 enrollment,
  mentor) esa faqat `npm run dev:memory`ning vaqtinchalik bazasida saqlangan edi.
  Natijada ikkala panel ham "Invalid email or password" berdi.
- Yechim: `npm run seed:all` (`scripts/seed-real.cjs`) — `.env`dagi MongoDB'ga
  CEO hisobi va LMS demo ma'lumotlarini yozadi (takror ishga tushirsa xavfsiz:
  mavjud hisob paroli saqlanadi).
- Kirish ma'lumotlari:
  - CEO paneli (http://localhost:5180) - `ceo@mars.uz` / `secret123` (`.env`dan)
  - Mentor paneli (http://localhost:5178) - `mentor@mars.uz` / `Mentor123`
- Tekshiruv: `POST /ceo/login` va `POST /mentors/login` 200 qaytardi; brauzerda CEO
  login -> Guruhlar (9 guruh) -> guruh ichidagi o'quvchilar, mentor login ->
  Dashboard ("Salom, Sardor", 9 guruh, 15 o'quvchi) - 0 page error.
- Lokal commit: `mars-backend` `6a3114e` (feat(dev): seed the real database with one command).

### BP-06 - Belgilanmagan o'quvchi dars tugagach "kelmadi" bo'ladi

- **Mas'ul:** Mirobid
- **Holat:** DONE
- Qoida: dars tugagach, belgi qo'yilmagan o'quvchi **kelmadi (X)** deb hisoblanadi.
  Oldingi qoida ("belgilanmagan o'quvchi kelmadi deb hisoblanmaydi") bekor qilindi.
- Mentor panelida matritsa: o'tgan dars kunlaridagi bo'sh kataklar endi X bilan
  ko'rsatiladi (yumshoq qizil — "dars tugagan" belgisi). Kelgusi kunlar "belgilanmagan"
  (savol belgisi) qoladi; bugungi ustun yana ham belgi qo'yish uchun ochiq.
- Dars tugash vaqti `LESSON_END_HOUR = 20` (frontend: `mars-mentor/src/config/courseSchedule.js`,
  backend: `mars-backend/src/config/lessonSchedule.js`). Jadval statik — admin paneli
  belgilaganda yangilanadi.
- Matritsa har daqiqa qayta chiziladi: dars tugishi bilan kataklar o'z-o'zidan
  X ga aylanadi, mentor sahifani yangilashi shart emas.
- Backend hisobdorligi ham xuddi shu qoidaga o'tdi: `getGroupAttendance` va
  `getAttendanceStats` da tugagan darsdagi belgilanmagan o'quvchilar "kelmadi"
  hisobida. Dars hali tugamagan bo'lsa (bugun) faqat yozilgan belgilar hisoblanadi.
- Yon-yo'q tuzatish: `GET /attendance/stats` da mentor markazdagi barcha mentorlarning
  statistikasini ko'raryapti — endi faqat o'zining.
- Tekshiruv: backend 258/258 test yashil (3 ta yangi: tugagan darsdagi belgilanmagan
  o'quvchi hisobda kelmadi, statistika ham xil, guruhga o'quvchi qo'shish);
  brauzerda 9 ta o'tgan dars kunida X, 4 ta kelgusi kunda "?", bugungi ustunda
  belgi tanlash, 0 page error.
- Lokal commit: `mars-mentor` `b3ec1ee`, `mars-backend` `22699bf`.
- **Ochiq:** dars kuni bo'lgan, lekin mentor umuman yozmagan kunlar (butunlay
  yozuvsiz) matritsada X bo'ladi, ammo backend umumiy jami (darslar soni)ga
  qo'shilmaydi — "kutilgan darslar" hisobi keyingi qadam.

### Global dizayn - navbar rangi (barcha panellar)

- **Mas'ul:** Mirobid
- **Holat:** DONE
- Barcha 10 ta panelning **navbar** (topbar) brend ko'kiga o'kildi: **bir xil (solid)
  `#172A4E`** — gradient emas.
- **Faqat light rejimda** (`winter`) navbar ko'k; **night rejimda** eski ko'rinish
  qoladi (`bg-base-100`) — shunda navbar va sidebar **bir xil rangda** bo'ladi
  (chap yuqori burchak bir butun qora maydon).
- **Keyingi tuzatish (foydalanuvchi talabi):** night rejimda ham navbar ko'k qoldi —
  endi **ikki rejimda ham** `#172A4E`. Sabab: "dark mode da eski holatda qolayotsa".
- **Yakuniy qaror (foydalanuvchi aniqlashtirdi):** dark rejimda **ko'k bo'lmasin**,
  **qorong'i (eski holat) bo'lsin**. Ko'k faqat **light rejimda**:
  - light: navbar `bg-[#172A4E]`, sidebar brend bloki `bg-[#172A4E]` → bir butun ko'k
    burchak, ikonkalar/ism oq (`text-white/85`), avatar halqasi shaffof.
  - night: navbar `bg-base-100`, brend bloki `bg-base-100` → ikkalasi bir xil to'q,
    ikonkalar `base-content` rangida (avvalgidek).
- **Sidebar o'z rangida qoldi** (`bg-base-100`) — foydalanuvchi talabi.
- Tuzatilgan panel: admin, audit, branch-manager, ceo, finance, frontend, intern,
  mentor, parent, tutor (10 ta).
- Tekshiruv (mentor paneli, brauzerda): night rejimda `headerBg = rgb(20,21,25)` va
  `asideBg = rgb(20,21,25)` — bir xil; light rejimda `headerBg = rgb(23,42,78)`,
  `asideBg = rgb(255,255,255)`, tugmalar oq (85%), 0 page error. Build: mars-ceo,
  mars-mentor, mars-admin muvaffaqiyatli; qolgan 7 panelda `node_modules` yo'q.
- Commit: 10 panelda `style(navbar): one solid navy in the light theme, plain bar in
  night mode`, `style(navbar): keep the brand navy in the night theme too` va
  `style(theme): the brand navy belongs to the light theme only` (yakuniy holat).

### Global dizayn - sidebar tepa bloki (brend ko'k)

- **Mas'ul:** Mirobid
- **Holat:** DONE
- Sidebar'ning **tepa qismi** (MARS wordmark + "MENTOR PORTALI" / "CEO PORTALI" /
  "Admin Portal") endi **brend ko'kiga** (`#172A4E`) bo'ldi — navbar bilan bir xil.
  Light rejimda chap yuqori burchak **bir butun ko'k blok** bo'ladi.
- Wordmark ko'k fonda **oq** bo'ldi (avvalgi `theme === 'night' ? 'white' : 'navy'`
  sharti olib tashlandi — endi har doim oq); halqa brend sariqicha qoldi.
- Navy "badge" ikon o'rniga **sariq halqa** (`MarsIcon variant="ring"`) — navy
  belgi ko'k fonda ko'rinmasdi.
- Blok ostidagi chegara `border-white/10`.
- 10 ta panel: admin, audit, branch-manager, ceo, finance, frontend, intern,
  mentor, parent, tutor.
- Tekshiruv (brauzerda): light rejimda brend bloki `rgb(23,42,78)` va navbar
  `rgb(23,42,78)` — bir xil ko'k blok; night rejimda brend bloki ko'k, navbar
  `rgb(20,21,25)`; wordmark `rgb(255,255,255)`; 0 page error. Build: mars-ceo,
  mars-mentor, mars-admin muvaffaqiyatli.
- Commit: 10 panelda `style(sidebar): paint the brand block in the brand navy`.

### 2026-10-22 — Tasdiqlangan qarorlar (Mirobid)

1. **Logotip shrifti — Poppins 600** (kichik harfli `mars°`) ✅ ruxsat berildi.
   CHANEY/Pilat Extended varianti almashtirildi — `knowledge.md §11.3` ga yozildi.
2. **Mavzu matn rangi — `#232936`** (brend navy `#0D0D5B` emas) ✅ ruxsat berildi.
   `knowledge.md §11.2` ga "Mars Matn Rangi" tokeni qo'shildi.
3. **Dars kunlari — admin paneli qilinmaguncha statik.** Dushanba, chorshanba, juma,
   dars tugash 20:00. Sabab: jadvalni boshqarish uchun admin paneli kerak (FE-01 /
   FE-02), u hali yozilmagan. `knowledge.md §11.6` ga yozildi.
4. **Navbar/brend bloki `#172A4E`** — faqat light rejimda; to'q rejimda eski to'q holat.
   `knowledge.md §11.2` ga "Mars Navigatsiya Ko'ki" tokeni qo'shildi.

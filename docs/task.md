# MARS LMS — VAZIFALAR RO'YXATI

## 1. Umumiy qoidalar

### 1.1. Vazifa holatlari

- `TODO` — vazifa hali bajarilmagan.
- `IN PROGRESS` — vazifa ustida ish ketmoqda.
- `BLOCKED` — vazifa to'siq sababli davom eta olmayapti.
- `REVIEW` — vazifa tekshirish yoki ko'rib chiqishni kutmoqda.
- `DONE` — vazifa bajarilgan va tegishli talablar tekshirilgan.

Barcha vazifalar boshlang'ich holatda `TODO`.

### 1.2. Umumiy muddat

Barcha vazifalar uchun muddat: **2026-yil 31-oktyabr**.

### 1.3. Vazifalarni boshqarish

- Har bir engineer vazifalarni ko'rishi, qo'shishi va tahrirlashi mumkin.
- Har bir engineer vazifani `DONE` ga o'tkazishi mumkin.
- Yangi vazifa qo'shilganda mavjud vazifalar o'chirib yuborilmaydi.
- Vazifalar orasidagi bog'liqliklar saqlanadi.
- Vazifa boshqa engineerga bog'liq bo'lsa, uning ismi va tegishli vazifasi ko'rsatiladi.
- Biznes muammosining tasdiqlanmagan yechimi mustaqil ravishda vazifa sifatida yozilmaydi.
- AI faqat `knowledge.md` va `tasks.md` dan foydalanadi.

### 1.4. Vazifa yozish shakli

Har bir vazifada quyidagi ma'lumotlar bo'lishi kerak:

- Vazifa IDsi.
- Vazifa nomi.
- Mas'ul engineer.
- Holat.
- Muddat.
- Vazifaning tavsifi.
- Bog'liq vazifalar.
- Bajarilganini aniqlash mezonlari.

Ma'lumot noma'lum bo'lsa, taxmin qilinmaydi.

---

## 2. FRONTEND VAZIFALARI

### FE-01 — Admin Dashboard uchun umumiy tuzilma

- **Mas'ul:** Muslima
- **Holat:** TODO
- **Muddat:** 2026-10-31

**Vazifalar:**
- Admin Dashboard uchun boshlang'ich tuzilma va umumiy shablonni tayyorlash.
- Umumiy komponentlar va sahifalar tuzilmasini belgilash.
- Optom bilan birga sahifalarni taqsimlash.
- Yetishmayotgan sahifalarni aniqlash va muhokama qilish.

**Bog'liqliklar:** FE-02.

**Bajarish mezonlari:**
- Umumiy tuzilma tayyor bo'lishi.
- Frontend jamoasi undan qanday foydalanishni tushunishi.
- Sahifalar taqsimoti aniqlangan bo'lishi.

### FE-02 — Admin Dashboard sahifalarini yaratish

- **Mas'ullar:** Muslima, Optom
- **Holat:** TODO
- **Muddat:** 2026-10-31
- **Bog'liq vazifa:** FE-01

**Vazifalar:**
- Sahifalarni o'zaro taqsimlash.
- Biriktirilgan sahifalarni tasdiqlangan talablar asosida yaratish.
- Umumiy komponentlarni kelishish.
- Kerakli APIlarni Backend bilan kelishish.
- Yetishmayotgan funksiyalarni Team Lead bilan muhokama qilish.

**Bajarish mezonlari:**
- Biriktirilgan sahifalar yaratilgan bo'lishi.
- UI holatlari va validatsiyalar tekshirilishi.
- Ish review va QA uchun tayyor bo'lishi.

### FE-03 — CEO Dashboard boshlang'ich tuzilmasi

- **Mas'ul:** Mirobid
- **Holat:** DONE
- **Muddat:** 2026-10-31

**Vazifalar:**
- CEO Dashboard uchun boshlang'ich tuzilmani yaratish.
- Tasdiqlangan talablar doirasidagi sahifalarni aniqlash.
- Sahifalarni frontend jamoasi orasida taqsimlash.
- Kerakli APIlarni Backend bilan kelishish.

**Natija:** `mars-ceo` paneli yaratildi. `npm run build` muvaffaqiyatli, barcha 11
marshrut runtime'da xatosiz tekshirildi (login validatsiyasi, auth guard, himoyalangan
sahifalar, 404) hamda `react-toastify` bildirishnomalari ishlaydi. Sahifalar ro'yxati va
API bog'liqliklari `mars-ceo/docs/CEO-DASHBOARD.md` da qayd etilgan. Dastlabki sahifalar
taqsimoti keyinchalik Team Lead bilan kelishildi.

2026-10-19 holatiga Mirobid Team Lead sahifa taqsimotini tasdiqlaganini va Backend bilan
API kelishilganini tasdiqladi. Taqsimot: Overview/Profile/Login va Financial — Mirobid;
Attendance/Homework va ro'yxat sahifalari — frontend jamoasi. Ushbu guruh sahifalari
uchun alohida engineer nomlari berilmagan; nomlar taxmin qilinmadi. FE-03 boshlang'ich
tuzilma, taqsimot va API kelishuvi doirasida yakunlandi.

Guard tizimi to'ldirildi: `routes/ErrorBoundary.jsx` qo'shildi va `NotFound` himoyalangan
qismga catch-all sifatida ulandi. Tekshirildi — token yo'q bo'lsa noma'lum manzil ham
`/login` ga yo'naltiriladi; kirgan holatda noma'lum manzil shell ichida 404 ko'rsatadi;
sahifa render xatosi (jumladan lazy chunk yuklanmasligi) ErrorBoundary tomonidan ushlanadi
va shell (Sidebar) ishlashda davom etadi, boshqa sahifaga o'tilganda avtomatik tiklanadi.

**Bajarish mezonlari:**
- Boshlang'ich tuzilma tayyor bo'lishi.
- Sahifalar taqsimoti aniq bo'lishi.
- API bog'liqliklari qayd etilishi.

### FE-04 — CEO Dashboard sahifalarini yaratish

- **Mas'ullar:** Mirobid va unga biriktirilgan frontend engineerlar
- **Holat:** REVIEW
- **Muddat:** 2026-10-31
- **Bog'liq vazifa:** FE-03

**Vazifalar:**
- Taqsimlangan sahifalarni yaratish.
- Umumiy komponentlarni kelishish.
- Kerakli APIlarni ulash.
- Sahifalarni review qilish.

**Amaldagi holat bo'yicha izoh:** FE-03 panel tuzilmasi va marshrutlarni yaratgan.
CEO panelida Dashboard, Financial, Attendance, Homework va Profile sahifalari mavjud;
Students, Mentors, Groups, Branches, Payments va Audit Logs esa umumiy `EntityView`
orqali ko'rsatiladi. Bu FE-04 yakunlanganini anglatmaydi: taqsimlangan sahifalarni
tasdiqlangan talablar bo'yicha to'ldirish, API ulanishi va review/QA FE-04 doirasida
qoladi. Guruhlangan sahifalar uchun aniq engineer nomlari tasdiqlangan ma'lumotda yo'q.
2026-10-19 tekshiruvida CEO build muvaffaqiyatli bo'ldi. `/stats/overview`,
`/stats/financial`, `/stats/students`, `/stats/attendance`, `/stats/homework` va
`/stats/trends/monthly` endpointlari 200 qaytardi, ammo joriy dev bazasida analitik
hisoblagichlar va trend qiymatlari 0. `npm run dev` vaqtinchalik MongoDB ishlatgani
uchun server qayta ishga tushganda ma'lumotlar saqlanmaydi. Shu sabab grafik komponentlari
mavjud bo'lsa ham, hozir ko'rsatadigan analitik yozuvlar yo'q. Grafiklarni haqiqiy yoki
kelishilgan test ma'lumotlari bilan tekshirish FE-04 doirasida ochiq qoladi; ma'lumot
manbasi tasdiqlanmasdan sun'iy yozuvlar qo'shilmaydi.
Mirobid doimiy `.env` bazasidan foydalanishni tanlagach, 2026-10-19 kuni u bazaga
read-only tekshiruv o'tkazildi: login va barcha analitika endpointlari ishladi, lekin
students, branches, groups, mentors, payments, attendance, homework va trend
hisoblagichlari u yerda ham 0. Bazaga hech qanday yozuv qo'shilmadi.
2026-10-19: Grafiklar uchun ma'lumot bo'lmagan holat Dashboard, Financial, Attendance
va Homework sahifalarida bo'sh holat ko'rsatadigan qilib tuzatildi; CEO production build
muvaffaqiyatli. API integratsiyasi bo'sh javoblarda tekshirildi, ijobiy ma'lumotli
grafiklarni QA qilish haqiqiy ma'lumot kiritilmaguncha BLOKLANGAN. Mirobid doimiy
`.env` bazasiga haqiqiy ma'lumotni o'zi berishini tanladi; sun'iy yoki test yozuvlari
qo'shilmadi.

**Tekshiruv natijasi (2026-10-23):** Mirobid ruxsati bilan backend `.env` dagi
CEO loginidan faqat lokal API orqali autentifikatsiya va read-only QA uchun
foydalanildi; credential/tokenlar chiqarilmadi va biznes ma'lumotlari
o'zgartirilmadi. `/ceo/me`, dashboard statistikasi, moliya summary va payment/coin
detail endpointlari, student finance so'rovlari hamda Students Report statistikasi,
ro'yxati, profil va attendance endpointlari `200` qaytardi. Analitika va reportlarda
haqiqiy yozuvlar bor; order va homework statistikasi bo'sh, UI esa empty-state
ko'rsatadi. Headless Edge'da Login, Dashboard, Financial, Profile, Students Report,
Attendance va Homework marshrutlari ochildi; ko'rinadigan xato alerti yoki React
runtime exception bo'lmadi. CEO build muvaffaqiyatli, statistika so'rovlari mustaqil
loading/error holatiga ajratildi va 2 regression testi o'tdi. Boshqa engineerlarga
biriktirilgan umumiy EntityView sahifalarining QA/review'i tasdiqlanmagani uchun
FE-04 umumiy vazifasi `REVIEW` holatida qoldi.

**Natija (12-muammo — Students Count by Course, 2026-10-20):** CEO uchun
`/students-report` sahifasi qurildi.

*Backend* (`mars-backend`, branch `feat/intern-api`):
- `GET /students/report` — `search`, `branch`, `course` (ko'p), `studentStatus`,
  `page`, `limit` parametrlari. Hisob **backend**da qilinadi (frontendda emas),
  shuning uchun statistika va ro'yxat hech qachon kelishmaydi.
- Yangi entity yaratilmadi: mavjud `students`, `courses`, `groups`, `enrollment`
  va `branch` modellari qo'llanildi. O'quvchi holati `isActive`/`isFrozen` dan
  hosil qilinadi (Active / Frozen / Archived), kurs holati esa `enrollment.status`
  dan olinadi — ikki holat alohida saqlanadi (spec Rule 2).
- `enrollment` — kurs tarixi manbai (yakunlangan kurs hisobda qoladi);
  `group` — joriy guruh manbai. Ikkalasi birlashtiriladi, har bir o'quvchi har bir
  yo'nalishda **bir marta** hisoblanadi.
- Branch scope `utils/scope.js` orqali serverda tekshiriladi: BM/Admin boshqa
  filialning ma'lumotini API orqali ololmaydi (fail-closed).
- `scripts/seed-lms.js` + `scripts/lms-fixtures.js` — demo ma'lumot
  (3 filial, 4 kurs, 10 guruh, 12 o'quvchi, 17 enrollment) har bir qoida uchun
  maxsus holatlar bilan: ko'p kursli o'quvchi, tugallangan kurs, frozen,
  archived, transferred/dropped/suspended.
- `npm run test:students-report` — 27 ta assertion, **27/27 o'tdi**
  (spec §5 ssenariylari va §9 qabul mezonlari).

*Frontend* (`mars-ceo`):
- `src/pages/StudentsReport.jsx` — statistika kartalari (Total / Active /
  Frozen / Archived, bosilish orqali filtrga aylanadi), yo'nalishlar bo'yicha
  hisob jadvali (bosilsa filtrga qo'shiladi), filtrlar (Search, Branch, Course
  ko'p tanlovli AND bilan, Student Status), o'quvchilar jadvali
  (№, Name, Age, Course, Branch, Status), pagination, o'quvchi profili modal oynasi.
- `src/features/report/studentsReportSlice.js` — Redux slice.
- Sidebar, nav, route (`/students-report`) va store reduceri ulandi.

*Ishlab chiqarishda topilgan va tuzatilgan xato:* `Sidebar.jsx` lucide
ikonlarini `{item.icon}` sifatida render qilgan (React #31) — barcha sahifalar
`ErrorBoundary` ekraniga tushgan. Ikonlar endi `<Icon />` sifatida, `isComponentType`
yordamida render qilinadi. `framer-motion` importi `motion/react` ga o'tkazildi.

**Bajarish mezonlari:**
- Sahifalar tasdiqlangan talablarga mos bo'lishi.
- API integratsiyasi tekshirilishi.
- Ish QA uchun tayyor bo'lishi.

**Natija (2026-10-22 - CEO panelida o'quvchilar guruh ichida):**

Foydalanuvchi talabi bo'yicha CEO panelidagi alohida "Students" sahifasi olib
tashlandi - o'quvchilar endi o'z guruhi orqali ko'rinadi.

- `mars-ceo/src/pages/Groups.jsx` - `/groups`: qidiruv maydoni (ism, familiya yoki
  guruh nomi bo'yicha), guruh kartalari (filial, kurs, o'quvchi soni, birinchi
  4 ta o'quvchi).
- `mars-ceo/src/pages/GroupDetail.jsx` - `/group/:groupId`: o'quvchilar soni kartasi,
  filial/kurs/mentor, o'quvchilar jadvali (ism, telefon, yosh) va ichki qidiruv.
- `config/nav.js` dan "Students" elementi, `App.jsx` dan `/students` marshruti va
  eski `/groups` EntityView marshruti olib tashlandi.
- Backend `group.service.js` da `course` populate qo'shildi.
- Tekshiruv: build muvaffaqiyatli; runtime'da qidiruv (ism/familiya/guruh) va
  guruh ichidagi ro'yxat tekshirildi - 0 page error.

### FE-05 — Talaba frontend ishini ko'rib chiqish

- **Mas'ul:** Mirobid
- **Holat:** DONE
- **Muddat:** 2026-10-31

**Vazifalar:**
- Biriktirilgan talaba frontend ishini ko'rib chiqish.
- Kamchiliklar va xatolarni aniqlash.
- Tuzatish talablarini qayd etish.

**Bajarish mezonlari:**
- Review natijalari yozilgan bo'lishi.
- Zarur tuzatishlar alohida kuzatilishi.

**Review natijasi — 2026-10-19:**

- **FE-05-R1 — Yuqori, login ishlamaydi.** `mars-student/src/features/auth/authSlice.js`
  kirish vaqtida tokensiz `GET /admins` so'rovi yuboradi. Backenddagi `GET /admins`
  `authenticate` talab qiladi; amalda so'rov `401 Missing bearer token` qaytardi.
  Bundan tashqari, slice adminlar ro'yxatidagi `password`ni qiyoslaydi, lekin backend
  Admin modelida parol `select: false` bo'lib, JSON javoblaridan ham olib tashlanadi.
  Student login oqimi amaldagi backend bilan ishlamaydi.
- **FE-05-R2 — Yuqori, soxta sessiya tokeni.** Shu slice `mock.<id>.<phone>` token
  yaratadi. `ProtectedRoute` token borligini tekshiradi xolos; bu token backend JWT
  autentifikatsiyasidan o'tmaydi. Kirish aylanib o'tilgan taqdirda ham himoyalangan
  API so'rovlari ishlamaydi.
- **FE-05-R3 — Scope aniqlashtirilishi kerak.** `mars-student/src/App.jsx` da
  Dashboard va admin/mentor/branch/group/student ro'yxat marshrutlari bor; login
  sahifasi ham "Admin panel" deb nomlangan. Tasdiqlangan talaba sahifalari va
  ruxsatlari `knowledge.md` yoki `task.md`da belgilanmagan, shuning uchun kutilgan
  student UI scope'ini taxmin qilib o'zgartirish kiritilmadi.
- **FE-05-R4 — Backend mavjudligi haqida eskirgan flag.**
  `mars-student/src/features/entities/entities.js` mentors, branches, groups va
  students uchun `implemented: false` deb ko'rsatib, endpointlar yo'qligini bildiradi.
  Tekshiruvda `/branches`, `/groups`, `/students` `200`, `/mentors` esa auth talab
  qiluvchi `401` qaytardi; bular `404` emas. Flag va izoh backend holatiga mos emas.
- **Tekshiruv cheklovi:** `mars-student` production build ishga tushmadi, chunki
  loyihada Vite o'rnatilmagan (`vite is not recognized`). Dependency o'rnatilmadi;
  statik kod review va yuqoridagi read-only API tekshiruvi bajarildi.

**Alohida kuzatiladigan tuzatishlar:** `FE-05-R1` va `FE-05-R2` uchun backend/PM
tomonidan student autentifikatsiyasi va API sharti aniqlashtirilib, keyin Frontend
integratsiyasi kerak. `FE-05-R3` student paneli scope'i PM/Team Lead bilan belgilangach
hal qilinadi. `FE-05-R4` entity flaglarini backend endpoint holatiga moslashtirishni
talab qiladi. Bu tuzatishlarga mas'ullar hozirgi task/knowledge hujjatlarida belgilanmagan;
mas'ul nomlari taxmin qilinmadi. Review vazifasi bajarildi; kod tuzatishlari alohida
ish sifatida ochiq qoladi.

### FE-06 — Frontend hamkorligi va QA

- **Mas'ullar:** Barcha Frontend engineerlar
- **Holat:** IN PROGRESS
- **Muddat:** 2026-10-31

**Vazifalar:**
- Bir-birining ishini zarur hollarda ko'rib chiqish.
- QA bilan xatolarni takrorlash va tuzatish.
- Yetishmayotgan sahifalar va UI holatlarini aniqlash.
- Kerakli APIlarni Backenddan so'rash.
- Vazifa holatini yangilab borish.

**Bajarish mezonlari:**
- Review va xatolar qayd etilgan bo'lishi.
- Ish tegishli keyingi bosqichga tayyor bo'lishi.

**Mirobid bo'yicha tekshiruv (2026-10-23):** CEO frontend build va statistika
so'rovlari regression testi o'tdi; autentifikatsiyalangan read-only runtime QA
natijalari FE-04 ostida qayd etildi. Login, Dashboard, Financial, Profile, Students
Report, Attendance va Homework marshrutlari headless Edge'da xato alertisiz ochildi.
Boshqa frontend engineerlarning vazifalari va umumiy jamoaviy review natijalari
ushbu tekshiruv doirasiga kirmagani sababli FE-06 `IN PROGRESS` bo'lib qoladi.

---

## 3. BACKEND VAZIFALARI

### BE-01 — Admin modelini tekshirish

- **Mas'ul:** MARAZ
- **Holat:** TODO
- **Muddat:** 2026-10-31

**Vazifalar:**
- Mavjud Admin modelini tekshirish.
- Model maydonlari va tuzilmasini talablar bilan solishtirish.
- Validatsiyalarni tekshirish.
- Yetishmayotgan qismlarni yakunlash.

**Bajarish mezonlari:**
- Model tasdiqlangan talablarga mos bo'lishi.
- Kerakli validatsiyalar tekshirilishi.

### BE-02 — Group modelini yakunlash

- **Mas'ul:** MARAZ
- **Holat:** TODO
- **Muddat:** 2026-10-31

**Vazifalar:**
- Group modelining mavjud qismini ko'rib chiqish.
- Tugallanmagan qismlarni aniqlash.
- Model va validatsiyalarni yakunlash.
- Tegishli tekshiruvlarni bajarish.

**Bajarish mezonlari:**
- Model tasdiqlangan talablar bo'yicha tugallangan bo'lishi.
- Tegishli testlar o'tishi.

### BE-03 — Mentor va Tutor modellarini tekshirish

- **Mas'ul:** Rakom
- **Holat:** TODO
- **Muddat:** 2026-10-31

**Vazifalar:**
- Mentor va Tutor modellarining tayyorlik holatini tekshirish.
- Tugallanmagan qismlarni yakunlash.
- Kerakli routerlarni tekshirish va yakunlash.
- Validatsiyalarni talablar asosida tekshirish.

**Bajarish mezonlari:**
- Modellar, routerlar va validatsiyalar tayyor bo'lishi.
- Tegishli testlar o'tishi.

### BE-04 — CEO modeli va routerlari

- **Mas'ul:** Jamol
- **Holat:** TODO
- **Muddat:** 2026-10-31

**Vazifalar:**
- CEO modelini ishlab chiqish.
- Kerakli routerlarni yaratish.
- Frontend bilan API shartlarini kelishish.
- Kerakli xatolik holatlari va validatsiyalarni tekshirish.

**Bajarish mezonlari:**
- Kerakli endpointlar tasdiqlangan talablarga muvofiq ishlashi.
- Tegishli tekshiruvlar o'tishi.

### BE-05 — Finance modeli va validatsiyalari

- **Mas'ul:** Jamol
- **Holat:** TODO
- **Muddat:** 2026-10-31

**Vazifalar:**
- O'ziga biriktirilgan Finance modelini ishlab chiqish.
- Tasdiqlangan talablarga mos validatsiyalarni qo'shish.
- Kerakli APIlarni Frontend bilan kelishish.
- Mavjud moliya vazifalari va ularga tegishli bog'liqliklarni hisobga olish.

**Muhim eslatma:** `payment.model.js` intern maoshi uchun ishlatiladi. Ushbu faylni o'zgartirmaslik kerak.

**Bajarish mezonlari:**
- Finance modeli va validatsiyalar tayyor bo'lishi.
- Tegishli tekshiruvlar o'tishi.
- Frontend uchun kerakli API shartlari kelishilgan bo'lishi.

### BE-06 — Backend hamkorligi va API tekshiruvi

- **Mas'ullar:** Barcha Backend engineerlar
- **Holat:** TODO
- **Muddat:** 2026-10-31

**Vazifalar:**
- Modellar, routerlar va validatsiyalarni tekshirish.
- Frontend bilan API shartlarini kelishish.
- QA bilan xatolarni tuzatish.
- Noaniq talablarni aniqlashtirish.
- Vazifalar holatini yangilash.

**Bajarish mezonlari:**
- Backend ishlari tekshirilgan bo'lishi.
- APIlar tasdiqlangan talablarga mos bo'lishi.

---

## 4. PM VAZIFALARI

### PM-01 — Biznes muammolarini o'rganish

- **Mas'ul:** Optom
- **Holat:** TODO
- **Muddat:** 2026-10-31

**Vazifalar:**
- `knowledge.md` dagi 13 ta biznes muammosini ko'rib chiqish.
- Har bir muammo bo'yicha mavjud jarayonni o'rganish.
- Talablar va ochiq savollarni aniqlashtirish.
- Team Lead va tegishli engineerlar bilan muhokama qilish.
- Taklif etilgan yechimlarni kelishish va tasdiqlash jarayonini boshqarish.
- Tasdiqlangan qarorlarni hujjatlashtirish.

**Bajarish mezonlari:**
- Har bir muammoning o'rganish holati ma'lum bo'lishi.
- Taxminlar va tasdiqlangan talablar bir-biridan ajratilishi.
- Kelishilgan qarorlar keyingi vazifalar uchun tushunarli bo'lishi.

### PM-02 — Uchrashuv uchun taqdimot tayyorlash

- **Mas'ul:** Optom
- **Holat:** TODO
- **Muddat:** 2026-10-31

**Vazifalar:**
- O'rganilgan muammolar va natijalarni tayyorlash.
- Ochiq savollar va kelishilishi kerak bo'lgan masalalarni ko'rsatish.
- Uchrashuvda natijalarni taqdim etish.
- Kelishilgan qarorlarni va keyingi vazifalarni qayd etish.

**Bajarish mezonlari:**
- Taqdimot tayyor bo'lishi.
- Uchrashuv natijalari hujjatlashtirilishi.

### PM-03 — Talablar va vazifalarni muvofiqlashtirish

- **Mas'ul:** Optom
- **Holat:** TODO
- **Muddat:** 2026-10-31

**Vazifalar:**
- Team Lead bilan talablarni aniqlashtirish.
- Vazifalar uchun mas'ul odam va bajarish mezonlarini aniqlash.
- Ochiq savollar va bog'liqliklarni kuzatish.
- Tasdiqlangan qarorlarni vazifalar ro'yxatiga kiritish.

**Bajarish mezonlari:**
- Vazifalar tushunarli bo'lishi.
- Mas'ullar va bog'liqliklar qayd etilishi.

---

## 5. DEVOPS VAZIFALARI

### OPS-01 — Infratuzilmani o'rganish

- **Mas'ul:** Jamol
- **Holat:** TODO
- **Muddat:** 2026-10-31

**Vazifalar:**
- Serverlar bilan ishlashni o'rganish.
- Ma'lumotlar bazasi va ulanishlarni o'rganish.
- Docker va konteyner jarayonlarini o'rganish.
- CI/CD va deployment jarayonlarini o'rganish.
- DoS/DDoS xavflari va himoya tamoyillarini o'rganish.

**Bajarish mezonlari:**
- O'rganish natijalari va tegishli ma'lumotlar qayd etilishi.
- Biriktirilgan amaliy ishlar tekshirilishi.

### OPS-02 — Test muhiti va deployment hamkorligi

- **Mas'ul:** Jamol
- **Holat:** TODO
- **Muddat:** 2026-10-31

**Vazifalar:**
- Test muhiti ehtiyojlarini engineerlar va QA bilan kelishish.
- Infrastrukturaga oid muammolarni o'rganish.
- Tasdiqlangan deployment va undan keyingi tekshiruvlarda qatnashish.

**Bajarish mezonlari:**
- Muhit bilan bog'liq muammolar qayd etilishi.
- Deployment tekshiruvlari hujjatlashtirilishi.

---

## 6. QA VAZIFALARI

### QA-01 — Talablar va test doirasini o'rganish

- **Mas'ul:** MUFASSA
- **Holat:** TODO
- **Muddat:** 2026-10-31

**Vazifalar:**
- Talablar va qabul qilish mezonlarini o'rganish.
- Rollar va ruxsatlarni ko'rib chiqish.
- Ijobiy, salbiy, chegaraviy va regression ssenariylarini aniqlash.
- Noaniq talablarni PM yoki mas'ul odam bilan aniqlashtirish.
- Test checklist yoki test holatlarini tayyorlash.

**Bajarish mezonlari:**
- Test doirasi hujjatlashtirilgan bo'lishi.
- Noaniq talablar alohida qayd etilishi.

### QA-02 — Mavjud funksiyalarni test qilish

- **Mas'ul:** MUFASSA
- **Holat:** TODO
- **Muddat:** 2026-10-31

**Vazifalar:**
- Loyihada amalga oshirilgan funksiyalarni test qilish.
- Login, logout va ruxsatlarni tekshirish.
- Formlar, validatsiyalar va CRUD amallarini tekshirish.
- API javoblari va xatolik holatlarini tekshirish.
- Ma'lumotlar saqlanishi va Frontend-Backend integratsiyasini tekshirish.
- Ta'lim va moliyaga tegishli ish jarayonlarini tasdiqlangan talablar asosida tekshirish.

**Bajarish mezonlari:**
- Test natijalari qayd etilishi.
- Muvaffaqiyatsiz testlar uchun xato hisobotlari yaratilishi.

### QA-03 — Xatolarni qayd etish va mas'ulni belgilash

- **Mas'ul:** MUFASSA
- **Holat:** TODO
- **Muddat:** 2026-10-31

**Vazifalar:**
- Xato IDsi yoki task havolasini yaratish.
- Takrorlash qadamlari, kutilgan va haqiqiy natijani yozish.
- Muhit, jiddiylik darajasi va dalillarni qo'shish.
- Mas'ul engineerga xabar berish yoki uni belgilash.
- Tuzatilgan xatolarni qayta test qilish.

**Bajarish mezonlari:**
- Xatolar tushunarli va takrorlanadigan bo'lishi.
- Har bir xato uchun mas'ul va qayta test natijasi qayd etilishi.

### QA-04 — Regression testlari

- **Mas'ul:** MUFASSA
- **Holat:** TODO
- **Muddat:** 2026-10-31

**Vazifalar:**
- Tuzatilgan xatolarni qayta tekshirish.
- O'zgarish ta'sir qilishi mumkin bo'lgan boshqa funksiyalarni tekshirish.
- Ruxsatlar, filial ma'lumotlari, ta'lim jarayoni va moliyaga oid muhim holatlarni tekshirish.
- Tasdiqlangan talablar o'zgarsa, test holatlarini yangilash.

**Bajarish mezonlari:**
- Tegishli regression testlar o'tkazilishi.
- Natijalar qayd etilishi.

### QA-05 — QA hisoboti

- **Mas'ul:** MUFASSA
- **Holat:** TODO
- **Muddat:** 2026-10-31

**Vazifalar:**
- Tekshirilgan funksiyalarni ko'rsatish.
- O'tgan va o'tmagan testlarni qayd etish.
- Xatolarni jiddiylik darajasi bo'yicha jamlash.
- Qayta test natijalari va qolgan xavflarni yozish.
- QA holatini `Passed`, `Failed` yoki `Blocked` sifatida bildirish.

**Bajarish mezonlari:**
- Hisobot dalillarga asoslangan bo'lishi.
- Tekshirilmagan holatlar yashirilmasligi.

---

## 7. BIZNES MUAMMOLARI BO'YICHA PM KUZATUVI

Quyidagi vazifalar yechimni o'ylab topish uchun emas, muammolarni o'rganish va tasdiqlangan qarorlarni kuzatish uchun yaratilgan.

### BP-01 — Qo'shimcha darslarga ro'yxatdan o'tish

- **Mas'ul:** Optom
- **Holat:** TODO
- **Muddat:** 2026-10-31
- **Bog'liq yo'nalishlar:** Frontend, Backend, QA

### BP-02 — O'quvchi darsga kelmaganidagi moliyaviy qoida

- **Mas'ul:** Optom
- **Holat:** TODO (qoidalar PM'ning; texnik tomoni 2026-10-22 da aniqlashtirildi)
- **Muddat:** 2026-10-31
- **Bog'liq yo'nalishlar:** Backend, Finance, QA
- **Hozirgi texnik holat (2026-10-22):**
  - Backend allaqachon "kelmadi" uchun to'lov yaratadi: ketma-ket 1–3 kelmaslik
    (`createAttendancePayment`), 3 dan keyin o'quvchi freeze bo'ladi
    (`checkAndFreezeIfNeeded`), kelgan o'quvchiga +1 coin beriladi.
  - **Bizning yangi qoidamiz to'lovni avtomatik qo'llaydi:** dars tugagach
    (20:00) belgilanmagan o'quvchi "kelmadi" deb hisoblanadi — ya'ni mentor
    belgi qo'ymasa, to'lov ham o'zi paydo bo'ladi.
  - **Qolgan qism PM qaroriga bog'liq:** coin qoidasi (mentor to'lovining
    o'zgarishi), qancha kun dan keyin to'lov, naqd/karta farqi, bekor qilish
    shartlari.
  - Mentor bugungi o'zgartirishlari (sabab bilan) to'lovni **qayta hisoblamaydi** —
    kelgan o'quvchiga berilgan coin va yaratilgan to'lov o'zgarishmaydi. Bu
    alohida masala (moliyaviy izoh kerak).

### BP-03 — Davomatning noto'g'ri belgilanishi

- **Mas'ul:** Optom
- **Holat:** TODO (frontend qismi bajarilgan, PM tasdiqlashi kerak)
- **Muddat:** 2026-10-31
- **Bog'liq yo'nalishlar:** Frontend, Backend, QA
- **Natija (2026-10-22, frontend + backend):**
  - Mentor panelida davomat belgilash oqimi qurildi (avval umuman yo'q edi):
    guruh → o'quvchilar → Keldi/Kelmadi → avto-save (Saqlash tugmasi yo'q).
  - **O'zgartirish izohi:** `attendance.changes[]` — kim, qaysidan qaysiga, sabab,
    qachon. CEO o'quvchi profilida ko'radi.
  - **`present` belgisiz yozuv "kelgan" deb hisoblanmasdi** (mentorga to'lov xavfi) —
    tuzatildi, belgisiz belgi "kelmadi" hisoblanadi.
  - **Bir darsga ikki marta saqlash mumkin edi** (mentor ikki marta to'lanardi) —
    endi `(group, lessonSession)` unique va takror saqlash 409 beradi.
  - **Yangi qoida:** dars tugagach (20:00) belgilanmagan o'quvchi **kelmadi (X)**
    deb hisoblanadi — matritsada ham, backend hisobdorligida ham.
  - Mentor faqat o'z guruhini belgilaydi (server-side 403).
- **Qolgan qismlar (to'liq yopish uchun):**
  1. **Mentor kechagi darsni tuzatolmaydi** — UI faqat bugungi sanani tahrirlaydi
     (backend PUT'da sana tekshiruvi yo'q, lekin imkoniyat yo'q). "Kechagi darsni
     sabab bilan o'zgartirish" kerak.
  2. **"Kutilgan darslar" hisobi** — dars kuni bo'lgan, lekin mentor umuman
     yozmagan kunlar matritsada X ko'rinadi, ammo umumiy statistikada
     (darslar soni, daraja) hisobga olmaydi.
  3. **Coin va to'lov qoidasi** — kelmagan o'quvchi uchun to'lov/coin qoidalari
     BP-02 bilan bog'liq, hali PM qarori yo'q.
  4. **PM (Optom) biznes qarorini tasdiqlab** BP-03 ni DONE deb belgilashi kerak.

### BP-04 — Uy vazifasini topshirish muammosi

- **Mas'ul:** Optom
- **Holat:** TODO
- **Muddat:** 2026-10-31
- **Bog'liq yo'nalishlar:** Frontend, Backend, QA

### BP-05 — Mentor uy vazifasi holatini ko'ra olmasligi

- **Mas'ul:** Optom
- **Holat:** TODO
- **Muddat:** 2026-10-31
- **Bog'liq yo'nalishlar:** Frontend, Backend, QA

### BP-06 — Mentor davomatni belgilay olmasligi

- **Mas'ul:** Mirobid (frontend), jamoa (backend)
- **Holat:** DONE
- **Muddat:** 2026-10-31
- **Bog'liq yo'nalishlar:** Frontend, Backend, QA
- **Natija:** Mentor paneli qurildi va davomat oqimi ishlaydi.
  - `mars-mentor` paneli avval admin panelining nusxasi edi (3 fayl / 7 qator farq):
    mock login, admin navigatsiyasi va davomat funksiyasi umuman yo'q edi. Endi haqiqiy
    mentor autentifikatsiyasi (`POST /mentors/login` — email yoki telefon), mentor scope,
    Dashboard / Davomat / Guruhlarim / O'quvchilar / Profile sahifalari bor.
  - Davomat oqimi: guruh → dars (ixtiyoriy) → o'quvchilar ro'yxati → «Keldi / Kelmadi»
    → Saqlash → tasdiq; xatolikda xabar va qayta urinish. Qayta ochilganda saqlangan
    belgilar tiklanadi.
  - Qoidalar: mentor faqat o'z guruhi (server-side 403), faqat bugungi sana (400),
    belgilanmagan o'quvchi «Kelmadi» deb hisoblanmaydi (UI belgilanmaganlar sonini ko'rsatadi).
  - Backend tuzatilgan: `present` belgisiz yozuv "kelgan" deb hisoblanmasdi (mentorga
    to'lov puli xavfi) va bir dars uchun ikki marta saqlash mumkin edi (mentor ikki marta
    to'lanardi) — endi `(group, lessonSession)` unique va takror saqlash 409 beradi.
  - Mentor login limiteri endi `RATE_LIMIT_LOGIN_MAX` orqali sozlanadi (dev uchun 200).
- **Tekshiruv:** jamoaning 255 ta backend testi yashil; runtime: login → guruh → o'quvchilar
  → belgilash → saqlash (201) → qayta ochilganda tiklash, 0 page error.
- **Hujjat:** `mars-mentor/README.md` va `mars-ceo/docs/PROBLEM-12-STUDENTS-REPORT.md` uslubida.

### BP-07 — Uy vazifalarining bajarilmasligi

- **Mas'ul:** Optom
- **Holat:** TODO
- **Muddat:** 2026-10-31
- **Bog'liq yo'nalishlar:** PM, Frontend, Backend, QA

### BP-08 — O'quvchilarning to'lovni unutishi

- **Mas'ul:** Optom
- **Holat:** TODO
- **Muddat:** 2026-10-31
- **Bog'liq yo'nalishlar:** PM, Finance, QA

### BP-09 — Filial bo'yicha naqd pul miqdori

- **Mas'ul:** Optom
- **Holat:** TODO
- **Muddat:** 2026-10-31
- **Bog'liq yo'nalishlar:** Finance, Frontend, Backend, QA

### BP-10 — To'lovchi va to'lov turi haqidagi ma'lumotlar

- **Mas'ul:** Optom
- **Holat:** TODO
- **Muddat:** 2026-10-31
- **Bog'liq yo'nalishlar:** Finance, Frontend, Backend, QA

### BP-11 — Filial xarajatlari va kategoriyalari

- **Mas'ul:** Optom
- **Holat:** TODO
- **Muddat:** 2026-10-31
- **Bog'liq yo'nalishlar:** Finance, Frontend, Backend, QA

### BP-12 — Ta'lim yo'nalishlari bo'yicha o'quvchilar soni

- **Mas'ul:** Mirobid (frontend), jamoa (backend)
- **Holat:** DONE
- **Muddat:** 2026-10-31
- **Bog'liq yo'nalishlar:** Frontend, Backend, QA
- **Natija:** CEO panelida `/students-report` sahifasi — yo'nalishlar bo'yicha o'quvchilar soni.
  - Backend: jamoaning o'z implementatsiyasi (`GET /students/report/stats | /students |
    /students/:id`, `LMS-JAMOL/MARS-backend` `main` branchida). Uning `byCourse` da har bir
    kurs ikki marta qaytarilayotgani tuzatildi (guruhlash butun link obyekti bo'yicha
    edi) — endi bir qator va to'g'ri unikal son.
  - Frontend: statistika kartalari, yo'nalishlar jadvali, Search / Branch / Course (AND) /
    Student Status filtrlari, o'quvchilar jadvali, o'quvchi profili va o'qish tarixi.
  - O'quvchi holati va kurs holati alohida: kursni tugatgan o'quvchi umumiy hisobda faol qoladi.
- **Tekshiruv:** jamoaning 53 ta Student Report testi yashil; runtime 13/13 marshrut, 0 xato.
- **Hujjat:** `mars-ceo/docs/PROBLEM-12-STUDENTS-REPORT.md`.

### BP-13 — Oylik kontrakt to'lovlari holati

- **Mas'ul:** Optom
- **Holat:** TODO
- **Muddat:** 2026-10-31
- **Bog'liq yo'nalishlar:** Finance, Frontend, Backend, QA

**Muhim:** BP vazifalarida muammo va unga aloqador ish yo'nalishlari qayd etilgan. Bu yo'nalishlar yechim tasdiqlanganini anglatmaydi. Dasturlash vazifalari PM tomonidan kelishilgan talablar asosida aniqlashtiriladi.

---

## 8. JAMOAVIY VAZIFALAR

### TEAM-01 — Vazifalar holatini yangilash

- **Mas'ullar:** Barcha engineerlar
- **Holat:** TODO
- **Muddat:** 2026-10-31

**Vazifalar:**
- Vazifalar holatini dolzarb saqlash.
- Bajarilgan ishlarni `DONE` ga o'tkazish.
- To'siqlar va bog'liqliklarni qayd etish.
- Keraksiz kechikishlarga yo'l qo'ymaslik.

### TEAM-02 — Vazifalar va bog'liqliklarni aniqlashtirish

- **Mas'ullar:** Optom, Muslima
- **Holat:** TODO
- **Muddat:** 2026-10-31

**Vazifalar:**
- Vazifalar egalarini va bog'liqliklarini tekshirish.
- Frontend, Backend, QA va DevOps orasidagi bog'liqliklarni qayd etish.
- Noaniq topshiriqlarni tegishli odamlar bilan aniqlashtirish.

### TEAM-03 — Hujjatlarni yuritish

- **Mas'ul:** Mirobid
- **Holat:** DONE
- **Muddat:** 2026-10-31

**Vazifalar:**
- `knowledge.md` faylini yangilab borish.
- Jamoa rollari va umumiy ish qoidalarini dolzarb saqlash.
- Tasdiqlangan jarayon o'zgarishlarini hujjatlashtirish.

**Bajarish mezonlari:**
- Hujjat tasdiqlangan ma'lumotlarga mos bo'lishi.
- Eskirgan yoki noto'g'ri ma'lumotlar yangilanishi.

**2026-10-19 tekshiruvi:** `knowledge.md` va `task.md`dagi vazifalar/rollar
solishtirildi. `knowledge.md` bir nechta joyda vazifalar faylini `tasks.md` deb
ko'rsatgan, lekin haqiqiy fayl nomi `task.md` edi. To'rtta havola to'g'ri nomga
yangilandi. Jamoa rollari yoki umumiy jarayon bo'yicha tasdiqlangan yangi ma'lumot
bo'lmagani uchun boshqa o'zgarish kiritilmadi.

---

## 9. VAZIFANI YAKUNLASH MEZONLARI

Vazifa quyidagi shartlar bajarilganda `DONE` bo'lishi mumkin:

1. Biriktirilgan ish bajarilgan.
2. Kelishilgan bajarish mezonlari qondirilgan.
3. Zarur review va testlar o'tkazilgan.
4. To'sqinlik qiluvchi xatolar tegishli tartibda hal qilingan.
5. Vazifa va hujjatlar yangilangan.
6. Kerakli topshirish yoki merge bosqichi yakunlangan.

Oddiy vazifada engineer bajarilganini bildirsa, AI holatni yangilashga yordam beradi. Muhim tekshiruv talab qiladigan vazifalarda natija va test dalillari aniqlashtiriladi.

Agar talab noaniq bo'lsa, taxminiy yechim yozish o'rniga ochiq savol qayd etiladi.

---

## 10. YANGI VAZIFALAR

Har qanday engineer yangi vazifa qo'shishi mumkin.

Yangi vazifa qo'shilganda:
- Yangi ID beriladi.
- Vazifa nomi va tavsifi yoziladi.
- Mas'ul engineer belgilanadi, agar ma'lum bo'lsa.
- Holati `TODO` qilib belgilanadi.
- Muddati 2026-10-31 qilib belgilanadi.
- Bog'liq vazifalar qayd etiladi.
- Bajarish mezonlari yoziladi, agar ular aniqlangan bo'lsa.

Agar biror ma'lumot hali ma'lum bo'lmasa, uni taxmin bilan to'ldirma. Ma'lum ma'lumotlarni saqlab, faqat yetishmayotgan ma'lumotni aniqlashtir.

**Umumiy qoida:** vazifalar ro'yxati jamoaning haqiqiy ish holatini aks ettirishi kerak. AI bajarilmagan ishni bajarilgan deb ko'rsatmasligi va tasdiqlanmagan biznes yechimlarini o'ylab topmasligi kerak.

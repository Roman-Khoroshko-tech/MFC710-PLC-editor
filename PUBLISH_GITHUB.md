# Публікація MFC710 PLC Studio на GitHub Pages

## 1. Підготовка

Розпакуйте архів. Вміст цієї папки має стати коренем репозиторію: `README.md`, `docs/`, `dist/`, `.github/` та інші файли повинні лежати поруч.

Рекомендована назва репозиторію: **mfc710-plc-studio**.

Опис репозиторію:

> Visual editor for the built-in MFC710 PLC. Block diagrams, PCH references and manual parameter export. UA / EN / PL.

Topics: `mfc710`, `plc`, `vfd`, `industrial-automation`, `fbd`, `offline`.

## 2. Завантаження через браузер

1. У GitHub натисніть **New repository**, введіть назву **mfc710-plc-studio** і виберіть **Public**. Не створюйте порожній README, .gitignore або ліцензію: готові файли є в пакеті.
2. Натисніть **Create repository**.
3. Виберіть **uploading an existing file** або **Add file → Upload files**.
4. Завантажте вміст розпакованої папки, включно з `.github/`, `.gitignore`, `.gitattributes` і `docs/.nojekyll`. Сам ZIP завантажувати замість файлів не потрібно.
5. Запишіть коміт `Initial MFC710 PLC Studio release candidate` у гілку **main**. Якщо браузер пропускає приховані файли чи структуру папок, скористайтеся GitHub Desktop або командами нижче.

## 3. Увімкнення сайту

1. Відкрийте репозиторій → **Settings → Pages**.
2. У **Build and deployment → Source** виберіть **Deploy from a branch**.
3. Виберіть **main** та папку **/docs**. Натисніть **Save**.
4. У **Actions** перевірте результат **Editor checks** та публікації **pages build and deployment**. Після завершення GitHub покаже фактичне посилання у **Settings → Pages**.

Очікуваний формат адреси: `https://ВАШ-ЛОГІН.github.io/mfc710-plc-studio/`. Це шаблон, а не створене посилання. Сайт ще не публікувався цим пакетом.

## Альтернатива: git

Створіть порожній репозиторій у GitHub. Відкрийте термінал у розпакованій папці та замініть YOUR-LOGIN своїм логіном:

```sh
git init
git add .
git commit -m "Initial MFC710 PLC Studio release candidate"
git branch -M main
git remote add origin https://github.com/YOUR-LOGIN/mfc710-plc-studio.git
git push -u origin main
```

Після push виконайте налаштування Pages з пункту 3.

## Оновлення

Змінюйте `dist/`, потім виконуйте:

```sh
npm test
npm run build
npm run check:pages
git add .
git commit -m "Update editor"
git push
```

Комітьте і вихідні файли, і оновлені `docs/index.html` та `MFC710_PLC_Studio.html`. Після зміни вмісту `docs` GitHub повторно публікує сайт.

## Перше приймання

Відкрийте сайт у Chrome або Edge. Перевірте всі мови, завантаження прикладу, створення з’єднання, Delete → Ctrl+Z, масштаб, збереження JSON та таблицю параметрів. Відкрийте завантажений JSON повторно. Звірте потрібну схему на цільовому MFC710 перед застосуванням параметрів.

Якщо збережена стара копія сторінки, оновіть її через Ctrl+F5. Автозбереження локального HTML та сайту різні – переносіть схеми через JSON.

## Документація GitHub

- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://github.com/actions/setup-node

Інструкцію звірено 20.11.2026.

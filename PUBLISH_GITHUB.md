# Публікація MFC710 PLC Studio

Сайт: https://roman-khoroshko-tech.github.io/MFC710-PLC-editor/
Портал: https://roman-khoroshko-tech.github.io/

## Оновлення

1. Зміни вихідні файли dist/, зберігаючи AGENTS.md.
2. Виконай npm test, npm run build, npm run check:pages.
3. Для критичних змін відкрий PR, дочекайся успішних перевірок і перевір редактор у браузері.
4. Після merge або push у main workflow Test and deploy editor повторить тести й збірку та опублікує тільки docs/.
5. Дочекайся успішного deploy і перевір реальну адресу.

## Налаштування

Settings → Pages → Source → GitHub Actions. Публікацію виконує .github/workflows/pages.yml. Branch deployment main/docs не потрібен. .github/workflows/checks.yml зберігає додаткові штатні перевірки.

## Локальне тестування

Node.js 24. npm install для основного набору не потрібен. npm start відкриває локальний сервер за адресою, зазначеною у виводі. Повний браузерний набір npm run test:browser потребує Playwright і браузера.

## Відкат

Перевір git status, знайди потрібний commit через git log, виконай git revert COMMIT_SHA. Повтори збірку та перевірку Pages, зроби commit згенерованих файлів за потреби і push. Не застосовуй force push.

Робочі схеми експортуються у JSON локально; не зберігай конфіденційні приклади у публічному репозиторії.

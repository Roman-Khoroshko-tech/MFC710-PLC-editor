/* UI prose belongs to the editor; technical PCH names come from MANUAL_LOCALES. */
const UI_TRANSLATION_ROWS=`
Редактор вбудованої логіки|Built-in PLC editor|Edytor wbudowanego PLC
Новий|New|Nowy
Приклади ▾|Examples ▾|Przykłady ▾
Завантажити|Load|Wczytaj
Зберегти|Save|Zapisz
Таблиця параметрів ↗|Parameter table ↗|Tabela parametrów ↗
Назва проєкту|Project title|Nazwa projektu
Новий проєкт|New project|Nowy projekt
Використання PLC|PLC usage|Wykorzystanie PLC
Використано:|Used:|Wykorzystano:
блоків|blocks|bloków
Час циклу:|Cycle time:|Czas cyklu:
мс|ms|ms
Блоки|Blocks|Bloki
Властивості|Properties|Właściwości
Перевірка|Validation|Sprawdzenie
Історія та масштаб|History and zoom|Historia i powiększenie
Скасувати|Undo|Cofnij
Повторити|Redo|Ponów
Зменшити масштаб|Zoom out|Pomniejsz
Збільшити масштаб|Zoom in|Powiększ
Центрувати схему|Fit diagram|Dopasuj schemat
Довідка та джерела|Help and sources|Pomoc i źródła
Мова інтерфейсу|Interface language|Język interfejsu
Автозбереження в браузері|Autosave in browser|Autozapis w przeglądarce
Збережено в цьому браузері|Saved in this browser|Zapisano w tej przeglądarce
Не вдалося зберегти – завантажте JSON|Autosave failed – save a JSON file|Autozapis nie powiódł się – zapisz plik JSON
Завантажте JSON для збереження|Save a JSON backup|Zapisz kopię JSON
КАТАЛОГ БЛОКІВ|BLOCK LIBRARY|KATALOG BLOKÓW
Пошук за назвою або №…|Search by name or number…|Szukaj według nazwy lub numeru…
Пошук блоків|Search blocks|Szukaj bloków
Категорія|Category|Kategoria
Усі категорії|All categories|Wszystkie kategorie
Арифметика|Arithmetic|Arytmetyka
Логіка|Logic|Logika
Лічильники|Counters|Liczniki
Часові|Time functions|Funkcje czasowe
Спеціальні|Special functions|Funkcje specjalne
Обмін|Communication|Komunikacja
Сигнали PCH|Characteristic Points (PCH)|Punkty Charakterystyczne (PCH)
Сталі|Constant values|Stałe
Посилання|References|Odsyłacze
Коментарі|Comments|Komentarze
Перетягніть блок на поле або натисніть +|Drag a block onto the canvas or click +|Przeciągnij blok na obszar roboczy lub kliknij +
функцій|functions|funkcji
Додати|Add|Dodaj
Опис та входи|Description and inputs|Opis i wejścia
Входи:|Inputs:|Wejścia:
сигнал PCH|PCH signal|sygnał PCH
числовий параметр|numeric parameter|parametr liczbowy
Окремі параметри групи 5; універсальні A/B/C неактивні.|Separate group 5 parameters; universal A/B/C inputs inactive.|Oddzielne parametry grupy 5; wejścia uniwersalne A/B/C są nieaktywne.
Позначення H – будь-яке ненульове значення, L – нуль.|H denotes any nonzero value; L denotes zero.|H oznacza dowolną wartość niezerową, L oznacza zero.
Текстовий коментар|Text comment|Komentarz tekstowy
Довільний текст на робочому полі|Free text on the canvas|Dowolny tekst w obszarze roboczym
Посилання · передавач|Reference · sender|Odsyłacz · nadajnik
Посилання · приймач|Reference · receiver|Odsyłacz · odbiornik
Приєднайте вихід до входу посилання|Connect an output to the reference input|Połącz wyjście z wejściem odsyłacza
Виберіть передавач і підключіть вихід далі|Select a sender and connect the receiver output|Wybierz nadajnik i podłącz wyjście odbiornika
Програмована стала|Constant value|Stała programowalna
24 ресурси · −32000…32000|24 resources · −32000…32000|24 zasoby · −32000…32000
ВЛАСТИВОСТІ БЛОКУ|BLOCK PROPERTIES|WŁAŚCIWOŚCI BLOKU
Виберіть блок|Select a block|Wybierz blok
Тут з’являться входи, параметри та опис функції з інструкції.|Inputs, parameters and the function description appear here.|Tutaj pojawią się wejścia, parametry i opis funkcji z instrukcji.
Входи, параметри та опис функції з інструкції з’являться тут.|Inputs, parameters and the function description appear here.|Tutaj pojawią się wejścia, parametry i opis funkcji z instrukcji.
Готово|Ready|Gotowe
PCH-сигнал|PCH signal|Sygnał PCH
Числовий параметр|Numeric parameter|Parametr liczbowy
ПЕРЕВІРКА СХЕМИ|DIAGRAM VALIDATION|SPRAWDZENIE SCHEMATU
Оновити|Refresh|Odśwież
Структурних помилок не виявлено. Масштаби сигналів і налаштування ПЧ перевіряються окремо.|No structural errors found. Signal scaling and drive settings require separate checks.|Nie znaleziono błędów struktury. Skalowanie sygnałów i nastawy przemiennika sprawdza się oddzielnie.
Готово до формування параметрів|Ready to generate parameters|Gotowe do wygenerowania parametrów
Є помилки · експорт заблоковано|Errors found · export blocked|Wykryto błędy · eksport zablokowany
Назва / коментар|Name / comment|Nazwa / komentarz
Власна назва|Custom name|Własna nazwa
Номер слоту виконання|Execution slot number|Numer bloku wykonawczego
Задає порядок виконання. Редактор ущільнює нумерацію до 1…N та переносить посилання PCH.|Defines execution order. The editor compacts slots to 1…N and remaps PCH connections.|Określa kolejność wykonania. Edytor porządkuje numerację do 1…N i aktualizuje połączenia PCH.
Функція|Function|Funkcja
слот|slot|blok
Параметр|Parameter|Parametr
Видалити блок|Delete block|Usuń blok
Видалити коментар|Delete comment|Usuń komentarz
Видалити посилання|Delete reference|Usuń odsyłacz
Видалити|Delete|Usuń
Заголовок|Title|Tytuł
Коментар|Comment|Komentarz
Введіть коментар…|Enter a comment…|Wpisz komentarz…
Підпис блока…|Block caption…|Podpis bloku…
Підпис блока|Block caption|Podpis bloku
Текст коментаря|Comment text|Treść komentarza
Введіть текст безпосередньо в полі на схемі. Перетягуйте за заголовок. Поле зростає вниз разом із текстом.|Enter text directly on the canvas. Drag the title to move it. The field grows downwards with the text.|Wpisz tekst bezpośrednio na schemacie. Przeciągaj za tytuł. Pole rośnie w dół wraz z tekstem.
Змінити ширину|Resize width|Zmień szerokość
Змінити висоту|Resize height|Zmień wysokość
Змінити розмір|Resize|Zmień rozmiar
Покажчик на сигнал. З’єднайте з виходом або виберіть PCH.|Signal pointer. Connect an output or select a PCH.|Wskaźnik sygnału. Połącz z wyjściem lub wybierz PCH.
Числове значення|Numeric value|Wartość liczbowa
точні межі в додатку B не наведені|exact limits are not specified in Appendix B|dokładne granice nie są podane w załączniku B
Вибрати джерело посилання|Select reference source|Wybierz źródło odsyłacza
Вхід посилання|Reference input|Wejście odsyłacza
Вихід посилання|Reference output|Wyjście odsyłacza
З’єднати назад|Rejoin connection|Połącz ponownie
Розбити на посилання|Split into references|Zamień na odsyłacze
Додати точку переміщення|Add waypoint|Dodaj punkt prowadzenia
Видалити точку|Delete waypoint|Usuń punkt prowadzenia
Точка переміщення|Waypoint|Punkt prowadzenia
Зв’язок вибрано · Delete видаляє|Connection selected · Delete removes it|Wybrano połączenie · Delete usuwa
Delete видаляє|Delete removes selection|Delete usuwa zaznaczenie
Показати або приховати панель|Show or hide panel|Pokaż lub ukryj panel
Змінити розмір панелі|Resize panel|Zmień rozmiar panelu
Джерело не вибрано|Source not selected|Nie wybrano źródła
Вхід не під’єднано|Input not connected|Wejście niepodłączone
Виберіть характеристичну точку|Select Characteristic Point|Wybierz Punkt Charakterystyczny
Вибрати характеристичну точку|Select Characteristic Point|Wybierz Punkt Charakterystyczny
Виберіть джерело|Select source|Wybierz źródło
Вибрати передавач|Select sender|Wybierz nadajnik
Невизначене посилання|Undefined reference|Niezdefiniowany odsyłacz
Приєднайте вихід|Connect an output|Podłącz wyjście
Цей передавач уже зайнятий. Створіть окрему пару посилань.|This sender is already in use. Create a separate reference pair.|Ten nadajnik jest zajęty. Utwórz oddzielną parę odsyłaczy.
Цей приймач уже під’єднаний. Для другого входу створіть окрему пару посилань.|This receiver is already connected. Create a separate pair for another input.|Ten odbiornik jest już podłączony. Dla drugiego wejścia utwórz oddzielną parę odsyłaczy.
Немає вільних передавачів. Додайте окремий передавач і під’єднайте його до виходу.|No free senders. Add a sender and connect it to an output.|Brak wolnych nadajników. Dodaj nadajnik i podłącz go do wyjścia.
Спочатку приєднайте вихід блока до посилання-передавача. Після цього він з’явиться у списку.|Connect a block output to a sender first. It will then appear in the list.|Najpierw podłącz wyjście bloku do nadajnika. Pojawi się on na liście.
Перетягніть до потрібного виходу · Esc скасовує|Drag to the required output · Esc cancels|Przeciągnij do wybranego wyjścia · Esc anuluje
Перетягніть|Drag|Przeciągnij
до входу блока · Esc скасовує|to a block input · Esc cancels|do wejścia bloku · Esc anuluje
Виберіть вихід для входу|Select an output for input|Wybierz wyjście dla wejścia
Вибрано|Selected|Zaznaczono
натисніть на вхід блока|click a block input|kliknij wejście bloku
зв’язків|connections|połączeń
ДЖЕРЕЛО СИГНАЛУ|SIGNAL SOURCE|ŹRÓDŁO SYGNAŁU
ПРОГРАМОВАНА СТАЛА|CONSTANT VALUE|STAŁA PROGRAMOWALNA
ПРИЗНАЧЕННЯ ПЧ|DRIVE ASSIGNMENT|PRZYPISANIE PRZEMIENNIKA
БЛОК|BLOCK|BLOK
ФУНКЦІЯ|FUNCTION|FUNKCJA
Вхід|Input|Wejście
Вихід|Output|Wyjście
вихід BL|output BL|wyjście BL
блоку|of block|bloku
Блок|Block|Blok
Стала|Constant|Stała
Сигнал|Signal|Sygnał
Значення|Value|Wartość
опція|option|opcja
LEN · стани|LEN · states|LEN · stany
Час|Time|Czas
Вихід при EN=0|Output when EN=0|Wyjście dla EN=0
Завантажити схему|Load diagram|Wczytaj schemat
Фізичні виходи та задатчики ПЧ призначаються окремо. Схема замінить поточну; Ctrl+Z поверне її.|Physical outputs and drive referencing-units are assigned separately. This replaces the current diagram; Ctrl+Z restores it.|Wyjścia fizyczne i zadajniki przemiennika przypisuje się oddzielnie. Schemat zastąpi bieżący; Ctrl+Z go przywróci.
блоків|blocks|bloków
цикл T|cycle T|cykl T
Параметри для ручного введення|Parameters for manual entry|Parametry do ręcznego wprowadzenia
Проєкт:|Project:|Projekt:
записів|entries|wpisów
Етап|Step|Etap
Призначення|Purpose|Przeznaczenie
Джерело|Source|Źródło
Завантажити CSV|Download CSV|Pobierz CSV
Друк / PDF|Print / PDF|Drukuj / PDF
Вводьте конфігурацію на зупиненому ПЧ. У таблиці лише задіяні блоки; 5.145 визначається автоматично. Перед 4.6 = 1 введіть код у 4.2 (заводський – 1; якщо код змінено, використайте чинний). Робочі дії виконуються на ПЧ за перевіреною схемою.|Enter the configuration with the drive stopped. Only used blocks are listed; 5.145 is calculated automatically. Before 4.6 = 1 enter the access code in 4.2 (factory code: 1; use the current code if changed). Apply settings to the drive only after checking the diagram.|Wprowadzaj konfigurację przy zatrzymanym przemienniku. Tabela zawiera tylko użyte bloki; 5.145 jest wyznaczany automatycznie. Przed 4.6 = 1 wpisz kod w 4.2 (fabryczny: 1; jeżeli zmieniono, użyj aktualnego). Wprowadzaj nastawy dopiero po sprawdzeniu schematu.
Я перевірив підтримку функцій >39 і мережеві режими на ПЧ. Дозволити їх експорт із попередженням суперечності документації.|I have verified support for functions >39 and communication modes on the drive. Allow export with a documentation discrepancy warning.|Sprawdzono obsługę funkcji >39 i trybów komunikacji w przemienniku. Zezwól na eksport z ostrzeżeniem o rozbieżności dokumentacji.
Непідтримуваний формат проєкту.|Unsupported project format.|Nieobsługiwany format projektu.
Некоректний елемент проєкту.|Invalid project element.|Nieprawidłowy element projektu.
Проєкт перевищує обмеження 2000 елементів після оновлення посилань.|Project exceeds 2000 elements after reference migration.|Po aktualizacji odsyłaczy projekt przekracza limit 2000 elementów.
Файл завеликий.|File too large.|Plik jest zbyt duży.
Файл відкрито.|Project loaded.|Projekt wczytany.
Створено новий проєкт. Попередню схему можна повернути кнопкою ↶.|New project created. Restore the previous diagram with ↶.|Utworzono nowy projekt. Poprzedni schemat przywrócisz przyciskiem ↶.
Цей ресурс уже використано.|This resource is already in use.|Ten zasób jest już używany.
Усі 48 слотів зайняті.|All 48 slots are in use.|Wszystkie 48 bloków jest zajętych.
Усі 24 сталі зайняті.|All 24 constants are in use.|Wszystkie 24 stałe są zajęte.
Виберіть вільний слот 1…48.|Select an unused slot from 1…48.|Wybierz wolny blok 1…48.
Невідома версія формату проєкту.|Unknown project format version.|Nieznana wersja formatu projektu.
5.145 має бути цілим числом 1…50.|5.145 must be an integer from 1…50.|5.145 musi być liczbą całkowitą 1…50.
Повторний ідентифікатор блока.|Duplicate block identifier.|Powtórzony identyfikator bloku.
Номер блоку поза 1…48.|Block number outside 1…48.|Numer bloku poza zakresem 1…48.
Невідома функція|Unknown function|Nieznana funkcja
використано двічі.|is used twice.|użyto dwukrotnie.
не виконуватиметься: його номер перевищує 5.145.|will not execute: its number exceeds 5.145.|nie będzie wykonywany: jego numer przekracza 5.145.
допускає один спільний ресурс.|allows only one shared resource.|dopuszcza tylko jeden wspólny zasób.
підтримку потрібно перевірити через суперечність додатків B і C.|support must be verified due to a discrepancy between Appendices B and C.|obsługę należy sprawdzić ze względu na rozbieżność między załącznikami B i C.
перевірте адресацію, роль master / адаптер і налаштування мережі; редактор не перевіряє фізичний зв’язок.|verify addressing, master role / adapter and network settings; the editor does not check the physical connection.|sprawdź adresację, rolę master / adapter i ustawienia sieci; edytor nie sprawdza połączenia fizycznego.
група параметра A має бути 0…6.|parameter group A must be 0…6.|grupa parametru A musi być 0…6.
C = B призводить до ділення на нуль.|C = B causes division by zero.|C = B powoduje dzielenie przez zero.
дільник c дорівнює нулю.|divisor c is zero.|dzielnik c jest równy zero.
B > C; перевірте задум і допустимість діапазону.|B > C; check the intended range.|B > C; sprawdź zamierzony zakres.
дільник C має бути додатним.|divisor C must be positive.|dzielnik C musi być dodatni.
час залежить від T = 5.145 × 0,2 мс. Межі числових входів не конкретизовані в додатку B; перевірте їх на ПЧ.|time depends on T = 5.145 × 0.2 ms. Numeric input limits are not specified in Appendix B; check them on the drive.|czas zależy od T = 5.145 × 0,2 ms. Granice wejść liczbowych nie są określone w załączniku B; sprawdź je w przemienniku.
Формувач кривої: порушено X1 ≤ X2 ≤ X3 ≤ X4 ≤ X5.|Curve shaping unit: X1 ≤ X2 ≤ X3 ≤ X4 ≤ X5 is violated.|Blok kształtowania krzywej: naruszono X1 ≤ X2 ≤ X3 ≤ X4 ≤ X5.
Номер сталої поза 1…24.|Constant number outside 1…24.|Numer stałej poza zakresem 1…24.
Повторний ресурс сталої.|Duplicate constant resource.|Powtórzony zasób stałej.
потрібне ціле число.|an integer is required.|wymagana jest liczba całkowita.
відсутня в підтвердженому каталозі.|is absent from the verified catalog.|nie występuje w potwierdzonym katalogu.
веде на блок, відсутній у проєкті.|points to a block absent from the project.|wskazuje blok nieobecny w projekcie.
читає|reads|odczytuje
зі свого або пізнішого слоту: врахуйте значення попереднього циклу.|from its own or a later slot: account for the previous cycle value.|z własnego lub późniejszego bloku: uwzględnij wartość z poprzedniego cyklu.
додайте відповідну сталу, щоб її значення потрапило в експорт.|add the corresponding constant to include its value in the export.|dodaj odpowiednią stałą, aby jej wartość znalazła się w eksporcie.
відсутній блок активації відповідного ресурсу.|the activation block for this resource is missing.|brak bloku aktywującego ten zasób.
необхідний опціональний модуль розширення.|an optional extension module is required.|wymagany jest opcjonalny moduł rozszerzeń.
значення поза|value outside|wartość poza
Експорт функцій >39 дозволено користувачем після перевірки підтримки; документ містить суперечність.|Export of functions >39 was enabled after support verification; the documentation contains a discrepancy.|Eksport funkcji >39 włączono po sprawdzeniu obsługi; dokumentacja zawiera rozbieżność.
Вимкнути PLC перед введенням конфігурації|Disable PLC before entering the configuration|Wyłącz PLC przed wprowadzeniem konfiguracji
Підготовка|Preparation|Przygotowanie
Ввести код доступу AL2 і підтвердити Enter. Заводський код 1; якщо змінено – використати чинний код|Enter the AL2 access code and confirm with Enter. Factory code: 1; use the current code if changed|Wpisz kod dostępu AL2 i potwierdź Enter. Kod fabryczny: 1; jeżeli zmieniono, użyj aktualnego
Увімкнути повні покажчики після введення коду доступу|Enable Full PCH after entering the access code|Włącz Pełne PCH po wpisaniu kodu dostępu
Конфігурація|Configuration|Konfiguracja
Кількість задіяних блоків; T =|Number of used blocks; T =|Liczba użytych bloków; T =
для порожньої схеми мінімум 1|minimum 1 for an empty diagram|minimum 1 dla pustego schematu
Цикл|Cycle|Cykl
Увімкнути PLC після перевірки введених значень|Enable PLC after checking the entered values|Włącz PLC po sprawdzeniu wprowadzonych wartości
Залишити PLC вимкненим: у схемі немає функціональних блоків|Keep PLC disabled: no functional blocks in the diagram|Pozostaw PLC wyłączony: brak bloków funkcyjnych na schemacie
Увімкнення|Enable|Załączenie
Вибір динаміки|Dynamics selection|Wybór dynamiki
Слот|Slot|Blok
Передавач|Sender|Nadajnik
Приймач|Receiver|Odbiornik
має більше одного приймача. Створіть окремі пари посилань.|has more than one receiver. Create separate reference pairs.|ma więcej niż jeden odbiornik. Utwórz oddzielne pary odsyłaczy.
має більше одного підключення. Створіть окремі пари посилань.|has more than one connection. Create separate reference pairs.|ma więcej niż jedno połączenie. Utwórz oddzielne pary odsyłaczy.
має відсутнє джерело або циклічне посилання.|has a missing source or a reference cycle.|ma brakujące źródło lub cykl odsyłaczy.
Непідтверджена або резервна PCH|Unverified or reserved PCH|Niepotwierdzony lub zarezerwowany PCH
Непідтверджене призначення|Unverified assignment|Niepotwierdzone przypisanie
призначено двічі.|is assigned twice.|przypisano dwukrotnie.
`;
const UI_TRANSLATIONS={en:{},pl:{}};
for(const line of UI_TRANSLATION_ROWS.trim().split('\n')){const [uk,en,pl]=line.split('|');UI_TRANSLATIONS.en[uk]=en;UI_TRANSLATIONS.pl[uk]=pl;}
const FUNCTION_NAMES={
 en:['Storing values','Sum','Product / division','Negation of sum','Absolute value','a + b − c','Output range limitation','Output range limitation · B, C','Constant offset','Multiplexer 1 of 2','Threshold selection','a ≥ b × C','a ≥ b + C','b − C ≤ a ≤ b + C','Hysteresis','Conversion 0…1000 → B…C','Conversion B…C → 0…1000','Store input value','OR','AND','Exclusive OR','NOR','NAND','NOT','Trigger RS','Trigger D (Latch)','Counter with reset and direction','One shot counter · down','Modulo up counter','Divider of frequency','Up counter','Binary decoder','Positive or negative impulse · parameters','Positive or negative impulse · PCH','Generator signal','Impulse delayed','Delayed shut down','Delayed switching on','Filter of analog signals','Fast counter','Sequencer','Multiplexer 1','Multiplexer 2','Curve shaping unit','Reading drive parameters','Modbus reading','Modbus writing','CAN reading','CAN writing'],
 pl:['Kopiowanie wartości','Suma','Iloczyn / dzielenie','Negacja sumy','Wartość bezwzględna','a + b − c','Ograniczenie zakresu wyjścia','Ograniczenie zakresu · B, C','Stały offset','Multiplekser 1 z 2','Wybór progowy','a ≥ b × C','a ≥ b + C','b − C ≤ a ≤ b + C','Histereza','Przekształcenie 0…1000 → B…C','Przekształcenie B…C → 0…1000','Zapamiętanie wartości wejścia','OR','AND','Exclusive OR','NOR','NAND','NOT','Przerzutnik typu RS','Przerzutnik typu D (Latch)','Licznik z zerowaniem i kierunkiem','Licznik one shoot · w dół','Licznik modulo w górę','Dzielnik częstotliwości','Licznik w górę','Dekoder binarny','Impuls pozytywny lub negatywny · parametry','Impuls pozytywny lub negatywny · PCH','Sygnał generatora','Impuls opóźniony','Opóźnione wyłączanie','Opóźnione załączanie','Filtr sygnałów analogowych','Szybki licznik','Sekwenser','Multiplekser 1','Multiplekser 2','Blok kształtowania krzywej','Odczyt parametrów przemiennika','Odczyt Modbus','Zapis Modbus','Odczyt CAN','Zapis CAN']
};
const FUNCTION_DESCRIPTION_ROWS=`
Фіксує значення входу на виході до наступного виконання.|Stores the input value at the output until the next execution.|Zapamiętuje wartość wejścia na wyjściu do następnego wykonania.
Сума трьох сигналів.|Sum of three input signals.|Suma trzech sygnałów wejściowych.
Усі три входи – PCH. Для множників використовуйте сталі.|All three inputs are PCH pointers. Use constants for factors.|Wszystkie trzy wejścia są wskaźnikami PCH. Dla współczynników użyj stałych.
Зміна знаку суми.|Negation of the sum.|Negacja sumy.
Абсолютне значення суми.|Absolute value of the sum.|Wartość bezwzględna sumy.
Сума двох входів мінус третій.|Sum of two inputs minus the third input.|Suma dwóch wejść minus trzecie wejście.
b – нижня межа, c – верхня межа.|b: lower limit; c: upper limit.|b: dolna granica; c: górna granica.
B і C – числові межі.|B and C are numeric limits.|B i C są granicami liczbowymi.
Додавання числового зміщення B.|Adds a constant offset B.|Dodaje stały offset B.
c – вибір: нуль → a; ненуль → b.|c selects the output: zero → a; nonzero → b.|c wybiera wyjście: zero → a; wartość niezerowa → b.
При a ≥ B вихід a, при a < B вихід c. У текстовому описі межі є неточність; тут наведена формула таблиці.|For a ≥ B output a; for a < B output c. The table formula is used because its prose description is inconsistent.|Dla a ≥ B wyjście a; dla a < B wyjście c. Zastosowano wzór z tabeli z powodu nieścisłości w opisie.
Вихід ненульовий, коли умова виконується.|Output is nonzero when the condition is satisfied.|Wyjście jest niezerowe, gdy warunek jest spełniony.
Перевірка потрапляння у смугу навколо b.|Tests whether the input is within the band around b.|Sprawdza, czy wejście znajduje się w paśmie wokół b.
Вище b+C → H; нижче b−C → L; усередині смуги стан зберігається.|Above b+C → H; below b−C → L; retains state inside the band.|Powyżej b+C → H; poniżej b−C → L; wewnątrz pasma stan jest zachowany.
Перетворення 0…1000 у діапазон B…C.|Converts 0…1000 to the range B…C.|Przekształca 0…1000 na zakres B…C.
Перетворення діапазону B…C у 0…1000.|Converts the range B…C to 0…1000.|Przekształca zakres B…C na 0…1000.
При a = 0 вихід зберігає попереднє значення.|For a = 0 the output retains its previous value.|Dla a = 0 wyjście zachowuje poprzednią wartość.
Логічна, а не побітова операція. Нуль – L, будь-яке ненульове значення – H.|Logical operation, not bitwise. Zero: L; any nonzero value: H.|Operacja logiczna, nie bitowa. Zero: L; dowolna wartość niezerowa: H.
Логічний добуток трьох входів.|Logical product of three inputs.|Iloczyn logiczny trzech wejść.
Виключне АБО двох логічних входів.|Exclusive OR of two logical inputs.|Exclusive OR dwóch wejść logicznych.
Інверсія логічної суми.|Inversion of the logical sum.|Negacja sumy logicznej.
Інверсія логічного добутку.|Inversion of the logical product.|Negacja iloczynu logicznego.
Логічна інверсія.|Logic inversion.|Negacja logiczna.
Пріоритет скидання R.|Reset input R has priority.|Wejście zerowania R ma priorytet.
Latch. Повна таблиця істинності наведена графічно в оригіналі.|Latch. The full truth table is shown graphically in the original manual.|Latch. Pełna tabela prawdy jest przedstawiona graficznie w oryginalnej instrukcji.
Діапазон −32768…32767. Мінімальний період CLK 20 мс.|Range −32768…32767. Minimum CLK period: 20 ms.|Zakres −32768…32767. Minimalny okres CLK: 20 ms.
Одноразовий відлік вниз, вхід початкового значення – PCH. Мінімальний період CLK 20 мс.|One-shot down counter; initial value is a PCH input. Minimum CLK period: 20 ms.|Jednorazowe zliczanie w dół; wartość początkowa jest wejściem PCH. Minimalny okres CLK: 20 ms.
Відлік угору modulo з дозволом. Мінімальний період CLK 20 мс.|Modulo up counter with enable input. Minimum CLK period: 20 ms.|Licznik modulo w górę z wejściem zezwolenia. Minimalny okres CLK: 20 ms.
a – частота, b – ENABLE, C – числовий дільник.|a: frequency; b: ENABLE; C: numeric divisor.|a: częstotliwość; b: ENABLE; C: dzielnik liczbowy.
Після 65535 відлік починається з нуля. Мінімальний період CLK 20 мс.|After 65535 the counter restarts from zero. Minimum CLK period: 20 ms.|Po 65535 licznik zaczyna od zera. Minimalny okres CLK: 20 ms.
Перетворює три логічні входи у число 0…7.|Converts three logical inputs to a number from 0…7.|Zamienia trzy wejścia logiczne na liczbę 0…7.
a – TRIG по позитивному фронту; C – полярність. Зсув виходу 1T, повторний запуск після завершення імпульсу.|a: rising-edge TRIG; C: polarity. Output delay: 1T; retriggering after the pulse ends.|a: TRIG na zbocze narastające; C: polaryzacja. Opóźnienie wyjścia: 1T; ponowne wyzwolenie po zakończeniu impulsu.
Як функція 32, але b та c – покажчики.|As function 32, but b and c are pointers.|Jak funkcja 32, ale b i c są wskaźnikami.
a – ENABLE. B і C – числові значення часу в тактах T.|a: ENABLE. B and C are numeric times in cycles T.|a: ENABLE. B i C są czasami liczbowymi w cyklach T.
a – вхідний імпульс. Часова діаграма – в оригіналі інструкції.|a: input impulse. See the timing diagram in the original manual.|a: impuls wejściowy. Wykres czasowy znajduje się w oryginalnej instrukcji.
Увімкнути / вимкнути з витримкою на вимкнення. Часова діаграма – в оригіналі.|Switch on/off with delayed shut down. See the original timing diagram.|Załącz / wyłącz z opóźnionym wyłączaniem. Patrz oryginalny wykres czasowy.
a – ON↑; b – OFF↑. Імпульс b під час витримки скасовує ввімкнення.|a: ON↑; b: OFF↑. An impulse on b during the delay cancels switching on.|a: ON↑; b: OFF↑. Impuls b w czasie opóźnienia anuluje załączenie.
Фільтрує суму входів. C – числова стала часу в тактах T.|Filters the sum of the inputs. C is a numeric time constant in cycles T.|Filtruje sumę wejść. C jest liczbową stałą czasową w cyklach T.
Імпульси надходять із DI5, до 2 кГц. Дозволено один екземпляр. При c ≠ 0 вихід H – саме так наведено в таблиці.|Pulses come from DI5, up to 2 kHz. One instance allowed. For c ≠ 0 the table specifies output H.|Impulsy z DI5, do 2 kHz. Dozwolony jeden egzemplarz. Dla c ≠ 0 tabela określa wyjście H.
Один спільний ресурс. Активація займає слот універсального блоку. Керування – параметри 5.40…5.55.|One shared resource. Activation occupies a universal block slot. Control parameters: 5.40…5.55.|Jeden wspólny zasób. Aktywacja zajmuje blok uniwersalny. Parametry sterowania: 5.40…5.55.
Один MUX1. Активація займає слот, налаштування 5.60, 5.62…5.71.|One MUX1. Activation occupies a slot; parameters 5.60, 5.62…5.71.|Jeden MUX1. Aktywacja zajmuje blok; parametry 5.60, 5.62…5.71.
Один MUX2. Активація займає слот, налаштування 5.80, 5.82…5.91.|One MUX2. Activation occupies a slot; parameters 5.80, 5.82…5.91.|Jeden MUX2. Aktywacja zajmuje blok; parametry 5.80, 5.82…5.91.
Один ресурс. X1 ≤ X2 ≤ X3 ≤ X4 ≤ X5. Налаштування 5.101…5.111.|One resource. X1 ≤ X2 ≤ X3 ≤ X4 ≤ X5. Parameters 5.101…5.111.|Jeden zasób. X1 ≤ X2 ≤ X3 ≤ X4 ≤ X5. Parametry 5.101…5.111.
Читання параметра з груп 0…6. Діапазон номера B залежить від групи.|Reads a parameter from groups 0…6. The range of B depends on the group.|Odczytuje parametr z grup 0…6. Zakres numeru B zależy od grupy.
Лише master із номером 0. Адресація – таблиця 13.2. Потребує перевірки конфігурації зв’язку.|Only the master with address 0. Addressing: table 13.2. Verify communication configuration.|Tylko master o numerze 0. Adresacja: tabela 13.2. Sprawdź konfigurację komunikacji.
Запис значення PCH. Потребує перевірки ролі master і конфігурації зв’язку.|Writes a PCH value. Verify the master role and communication configuration.|Zapisuje wartość PCH. Sprawdź rolę master i konfigurację komunikacji.
Необхідний внутрішній адаптер CAN виробника.|Requires the manufacturer's internal CAN adapter.|Wymagana wewnętrzna przystawka CAN producenta.
Запис PCH через внутрішній адаптер CAN виробника.|Writes PCH through the manufacturer's internal CAN adapter.|Zapis PCH przez wewnętrzną przystawkę CAN producenta.
8 станів|8 states|8 stanów
5 точок (X, Y)|5 points (X, Y)|5 punktów (X, Y)
початок|initial value|wartość początkowa
поріг|threshold|próg
множник|multiplier|mnożnik
час|time|czas
Тривалість і полярність через PCH|Duration and polarity via PCH|Czas trwania i polaryzacja przez PCH
група|group|grupa
параметр|parameter|parametr
пристрій|device|urządzenie
регістр|register|rejestr
дані|data|dane
`;
for(const line of FUNCTION_DESCRIPTION_ROWS.trim().split('\n')){const [uk,en,pl]=line.split('|');UI_TRANSLATIONS.en[uk]=en;UI_TRANSLATIONS.pl[uk]=pl;}
const EXTRA_UI_ROWS=`
Вводьте конфігурацію на зупиненому ПЧ. У таблиці лише задіяні блоки; 5.145 визначається автоматично. Перед 4.6 = 1 введіть код у 4.2 (заводський – 1; якщо його змінено, використайте чинний). Зміни інших налаштувань ПЧ тут не перевіряються.|Enter the configuration with the drive stopped. Only used blocks are listed; 5.145 is calculated automatically. Before 4.6 = 1 enter the access code in 4.2 (factory code: 1; use the current code if changed). Other drive settings are not checked here.|Wprowadzaj konfigurację przy zatrzymanym przemienniku. Tabela zawiera tylko użyte bloki; 5.145 jest wyznaczany automatycznie. Przed 4.6 = 1 wpisz kod w 4.2 (fabryczny: 1; jeżeli zmieniono, użyj aktualnego). Pozostałe nastawy przemiennika nie są tutaj sprawdzane.
Я перевірив підтримку функцій >39 у конкретній версії ПЗ ПЧ. Дозволити їх експорт із позначенням суперечності документації.|I verified support for functions >39 in this drive firmware. Allow export with a documentation discrepancy warning.|Sprawdzono obsługę funkcji >39 w danej wersji oprogramowania przemiennika. Zezwól na eksport z ostrzeżeniem o rozbieżności dokumentacji.
Функція є в додатку B, але перевищує діапазон 0–39 із додатка C. Підтримку слід перевірити на ПЧ.|The function is listed in Appendix B but exceeds the 0–39 range in Appendix C. Verify support on the drive.|Funkcja występuje w załączniku B, lecz przekracza zakres 0–39 z załącznika C. Sprawdź obsługę w przemienniku.
Таблиця PCH · додаток A ↗|PCH table · Appendix A ↗|Tabela PCH · załącznik A ↗
Пуск / Стоп із самопідхопленням|Start / Stop with latching|Start / Stop z podtrzymaniem
Мотопотенціометр «Більше / Менше»|Motopotentiometer Up / Down|Motopotencjometr Więcej / Mniej
Наповнення резервуара|Tank filling|Napełnianie zbiornika
Відкачування з приямка|Sump drainage|Opróżnianie studzienki
Захист від сухого ходу із затримкою|Dry-run protection with delay|Zabezpieczenie przed suchobiegiem z opóźnieniem
Чергування двох насосів|Alternation of two pumps|Naprzemienna praca dwóch pomp
Автоматичне підключення резерву|Automatic standby pump selection|Automatyczny wybór pompy rezerwowej
Два завдання за дискретним входом|Two referencing-units selected by digital input|Dwa zadajniki wybierane wejściem cyfrowym
Масштабування аналогового сигналу|Analog signal scaling|Skalowanie sygnału analogowego
Періодична робота механізму|Periodic operation|Praca okresowa
Пуск запам’ятовується. Стоп або зняття дозволу скидає команду.|Start is latched. Stop or removal of the permission resets the command.|Start jest zapamiętywany. Stop lub odebranie zezwolenia zeruje polecenie.
Дві кнопки змінюють значення у межах 0…100. Разом натиснуті кнопки блокують такти.|Two buttons adjust the value within 0…100. Pressing both buttons blocks clock pulses.|Dwa przyciski zmieniają wartość w zakresie 0…100. Jednoczesne naciśnięcie blokuje impulsy zegarowe.
Вмикання нижче 20%, вимикання від 80%. Між порогами команда зберігається.|Switches on below 20% and off at 80%. The command is retained between the thresholds.|Załącza poniżej 20%, wyłącza od 80%. Między progami polecenie jest zachowane.
Вмикання від 80%, вимикання нижче 20%. Окремий сигнал переповнення від 95%.|Switches on at 80% and off below 20%. Separate overflow signal at 95%.|Załącza od 80%, wyłącza poniżej 20%. Oddzielny sygnał przepełnienia od 95%.
Втрата підтвердження води під час роботи протягом приблизно 3 с запам’ятовує аварію.|Loss of water confirmation during operation for about 3 s latches a failure.|Brak potwierdzenia wody podczas pracy przez około 3 s zapamiętuje awarię.
Черга змінюється за новими запитами. Дві команди взаємно виключаються.|Each new request changes the selected pump. The two commands are mutually exclusive.|Każde nowe żądanie zmienia wybraną pompę. Dwa polecenia wzajemnie się wykluczają.
При аварії основного або відсутності підтвердження пуску близько 3 с запам’ятовує вибір резервного.|A main pump failure or no start confirmation for about 3 s latches standby selection.|Awaria pompy głównej lub brak potwierdzenia startu przez około 3 s zapamiętuje wybór rezerwy.
DI2=0 обирає денне завдання 700; DI2=1 – нічне 400.|DI2=0 selects the day setting 700; DI2=1 selects the night setting 400.|DI2=0 wybiera nastawę dzienną 700; DI2=1 wybiera nocną 400.
Лінійне перетворення діапазону AI0 200…800 у 0…1000 з обмеженням результату.|Linear conversion of AI0 200…800 to 0…1000 with output limiting.|Liniowe przekształcenie AI0 200…800 na 0…1000 z ograniczeniem wyniku.
За дозволом DI1 формує повторювані інтервали роботи 2 с і паузи 3 с.|DI1 enables repeating intervals of 2 s operation and 3 s pause.|Zezwolenie DI1 uruchamia powtarzane okresy pracy 2 s i przerwy 3 s.
Якщо Пуск відпущено, після відновлення дозволу потрібне повторне натискання Пуск. Це звичайна логіка керування, не функція аварійної зупинки.|With Start released, a new press is required after permission returns. This is normal control logic, not an emergency stop function.|Po zwolnieniu Startu i powrocie zezwolenia trzeba ponownie nacisnąć Start. Jest to zwykła logika sterowania, a nie funkcja zatrzymania awaryjnego.
Для 9 блоків T=1,8 мс; B=C=28 → 50,4 мс кожна фаза, період 100,8 мс.|For 9 blocks T=1.8 ms; B=C=28 → 50.4 ms per phase, period 100.8 ms.|Dla 9 bloków T=1,8 ms; B=C=28 → 50,4 ms na fazę, okres 100,8 ms.
Час скориговано відносно попередньої таблиці з B=C=5. PCH264 можна призначити на потрібний задатчик або AO.|Timing was corrected from the previous B=C=5 table. Assign PCH264 to the required referencing-unit or AO.|Czasy skorygowano względem poprzedniej tabeli B=C=5. PCH264 można przypisać do wymaganego zadajnika lub AO.
Мінімальний період CLK лічильника за інструкцією – 20 мс.|The manual specifies a minimum counter CLK period of 20 ms.|Instrukcja podaje minimalny okres CLK licznika 20 ms.
Пороги 200 / 800 – навчальні значення. При поверненні дозволу команда поновлюється, якщо пам’ять наповнення активна.|Thresholds 200 / 800 are example values. When permission returns, the command resumes if the filling latch remains active.|Progi 200 / 800 są przykładowe. Po powrocie zezwolenia polecenie wraca, jeśli pamięć napełniania jest aktywna.
Початковий стан пам’яті перевіряють при пусконалагодженні.|Check the initial latch state during commissioning.|Sprawdź początkowy stan pamięci przy uruchomieniu.
Пороги 200 / 800 / 950 – навчальні значення. Переповнення тут є окремим сигналом, а не призначенням аварії ПЧ.|Thresholds 200 / 800 / 950 are example values. Overflow is a separate signal, not an assigned drive failure.|Progi 200 / 800 / 950 są przykładowe. Przepełnienie jest oddzielnym sygnałem, a nie przypisaniem awarii przemiennika.
DI1 не слід замикати на вихід цього дозволу: після спрацювання аварія має зберігатися.|Do not feed this permission output back to DI1: the failure must remain latched after tripping.|Nie podłączaj tego wyjścia zezwolenia zwrotnie do DI1: po zadziałaniu awaria musi pozostać zapamiętana.
Скидання має пріоритет; кнопку скидання не утримувати. Після скидання за чинної небезпеки почнеться нова витримка.|Reset has priority; do not hold the reset button. If the hazard remains after reset, a new delay starts.|Zerowanie ma priorytet; nie przytrzymuj przycisku. Jeśli zagrożenie pozostaje po zerowaniu, zaczyna się nowe opóźnienie.
Інтервал між фронтами запиту – не менше 20 мс. Початковий вибір перевіряють при запуску.|Request edges must be at least 20 ms apart. Check initial selection during commissioning.|Odstęp między zboczami żądania co najmniej 20 ms. Sprawdź wybór początkowy przy uruchomieniu.
Це сигнали вибору насосів. Силове перемикання двигунів одного ПЧ потребує окремої логіки зупинки та блокувань контакторів.|These are pump selection signals. Switching motors on one drive requires separate stop logic and contactor interlocks.|To sygnały wyboru pomp. Przełączanie silników jednego przemiennika wymaga oddzielnej logiki zatrzymania i blokad styczników.
Зняття запиту скидає вибір резерву. Повернення підтвердження основного саме по собі резерв не вимикає.|Removing the request resets standby selection. Main pump confirmation alone does not deselect standby.|Usunięcie żądania zeruje wybór rezerwy. Sam powrót potwierdzenia pompy głównej nie wyłącza rezerwy.
Справність резервного та силові блокування мають контролюватися окремо.|Standby availability and power circuit interlocks require separate checks.|Sprawność rezerwy i blokady obwodów mocy wymagają oddzielnej kontroli.
Сталі доступні для зміни. Вихід можна призначити на потрібний задатчик ПЧ окремо.|Constants can be adjusted. Assign the output to the required drive referencing-unit separately.|Stałe można zmieniać. Wyjście przypisz oddzielnie do wymaganego zadajnika przemiennika.
200 / 800 – приклад діапазону нормованого сигналу, а не налаштування 4–20 мА. Електричний тип AI налаштовується окремо.|200 / 800 is an example of a normalized range, not a 4–20 mA configuration. Configure the AI electrical type separately.|200 / 800 to przykładowy zakres znormalizowany, a nie nastawa 4–20 mA. Typ elektryczny AI skonfiguruj oddzielnie.
Для 2 блоків T=0,4 мс: B=5000 → 2 с; C=7500 → 3 с. Після зміни кількості блоків перерахуйте B та C.|For 2 blocks T=0.4 ms: B=5000 → 2 s; C=7500 → 3 s. Recalculate B and C after changing the number of blocks.|Dla 2 bloków T=0,4 ms: B=5000 → 2 s; C=7500 → 3 s. Po zmianie liczby bloków przelicz B i C.
Пуск, активний 1|Start, active high|Start, aktywny 1
Стоп, активний 1|Stop, active high|Stop, aktywny 1
Дозвіл роботи, 1 = дозволено|Operation permission, 1 = enabled|Zezwolenie pracy, 1 = dozwolone
Команда роботи|Run command|Polecenie pracy
Більше|Up|Więcej
Менше / напрямок|Down / direction|Mniej / kierunek
Завдання 0…1000|Referencing-unit 0…1000|Zadajnik 0…1000
AI0, рівень 0…1000 = 0…100%|AI0, level 0…1000 = 0…100%|AI0, poziom 0…1000 = 0…100%
AI0, рівень 0…1000|AI0, level 0…1000|AI0, poziom 0…1000
Зовнішній дозвіл роботи|External operation permission|Zewnętrzne zezwolenie pracy
Команда наповнення|Filling command|Polecenie napełniania
Команда відкачування|Drainage command|Polecenie opróżniania
Сигнал переповнення|Overflow signal|Sygnał przepełnienia
Незалежний запит / стан роботи|Independent request / operation state|Niezależne żądanie / stan pracy
Вода / тиск у нормі, активний 1|Water / pressure OK, active high|Woda / ciśnienie prawidłowe, aktywny 1
Ручне скидання, імпульс|Manual reset, pulse|Zerowanie ręczne, impuls
Аварія сухого ходу|Dry-run failure|Awaria suchobiegu
Запит роботи, кожен запуск – новий фронт|Run request, a new edge for each start|Żądanie pracy, nowe zbocze dla każdego startu
Вибір насоса 1|Pump 1 selection|Wybór pompy 1
Вибір насоса 2|Pump 2 selection|Wybór pompy 2
Запит роботи|Run request|Żądanie pracy
Аварія основного, активний 1|Main pump failure, active high|Awaria pompy głównej, aktywny 1
Підтвердження роботи основного|Main pump run confirmation|Potwierdzenie pracy pompy głównej
Ручне скидання вибору, імпульс|Manual selection reset, pulse|Ręczne zerowanie wyboru, impuls
Команда основному|Main pump command|Polecenie pompie głównej
Команда резервному|Standby pump command|Polecenie pompie rezerwowej
Вибір Ніч, активний 1|Night selection, active high|Wybór Noc, aktywny 1
Вибране завдання|Selected referencing-unit|Wybrany zadajnik
AI0, нормований сигнал 0…1000|AI0, normalized signal 0…1000|AI0, sygnał znormalizowany 0…1000
Масштабований сигнал|Scaled signal|Sygnał przeskalowany
Нижче нижньої межі|Below lower limit|Poniżej dolnej granicy
Верхню межу досягнуто|Upper limit reached|Osiągnięto górną granicę
Дозвіл циклічної роботи|Cyclic operation enable|Zezwolenie pracy cyklicznej
Циклічна команда роботи|Cyclic run command|Cykliczne polecenie pracy
`;
for(const line of EXTRA_UI_ROWS.trim().split('\n')){const [uk,en,pl]=line.split('|');UI_TRANSLATIONS.en[uk]=en;UI_TRANSLATIONS.pl[uk]=pl;}
for(const locale of ['en','pl']){
 FUNCTIONS.forEach((f,i)=>UI_TRANSLATIONS[locale][f.name]=FUNCTION_NAMES[locale][i]);
 for(const [pch,name]of Object.entries(PCH)){
  let official=MANUAL_LOCALES[locale].pch[pch];const n=Number(pch);
  if(n>=256&&n<=303)official=(locale==='en'?'UNIT number ':'BLOK nr ')+(n-255);
  if(n>=304&&n<=311)official=(locale==='en'?'SEQUENSER · state ':'SEKW. STAN ')+(n-303);
  if(n>=320&&n<=343)official=(locale==='en'?'CONST. ':'STAŁA ')+(n-319);
  if(locale==='en'&&n===70)official='Fref reached';if(locale==='en'&&n===72)official="Warning. Lack of the living zero";if(locale==='pl'&&n===64)official='NIE AWARIA';if(locale==='pl'&&n===66)official='AW. lub OST.';if(locale==='en'&&official)official=official.replace(/[АВМо]/g,c=>({'А':'A','В':'B','М':'M','о':'o'}[c]));if(official)UI_TRANSLATIONS[locale][name]=official;
 }
}
let uiLanguage='uk';
const translationPatterns={};
function translatedText(value,locale=uiLanguage){
 const text=String(value??'');if(locale==='uk'||!UI_TRANSLATIONS[locale])return text;
 const map=UI_TRANSLATIONS[locale];if(Object.hasOwn(map,text))return map[text];
 const whitespace=text.match(/^(\s*)(.*?)(\s*)$/s);if(whitespace&&Object.hasOwn(map,whitespace[2]))return whitespace[1]+map[whitespace[2]]+whitespace[3];
 if(!translationPatterns[locale]){
  const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  translationPatterns[locale]=new RegExp(Object.keys(map).sort((a,b)=>b.length-a.length).map(key=>(/^\p{L}/u.test(key)?'(?<![\\p{L}\\p{N}_])':'')+escape(key)+(/\p{L}$/u.test(key)?'(?![\\p{L}\\p{N}_])':'')).join('|'),'gu');
 }
 return text.replace(/Інструкція 7\.4 · (?:с\.|стор\.) (\d+)/g,(_m,page)=>manualCitation(Number(page),locale)).replace(/(?<![\p{L}])с\.(\d[\d,;–-]*)/gu,(_m,list)=>(locale==='en'?'p.':'str.')+[...new Set(list.split(/[,;–-]/).flatMap(n=>MANUAL_LOCALES[locale].pages[Number(n)]||[Number(n)]))].join(',')).replace(translationPatterns[locale],key=>map[key]);
}
function manualCitation(topic,locale=uiLanguage){
 if(locale==='uk')return 'Інструкція 7.4 · с. '+topic;
 const pages=MANUAL_LOCALES[locale]?.pages[topic]||[topic];return(locale==='en'?'Manual 8.1 · p. ':'Instrukcja 8.1 · str. ')+pages.join(', ');
}
function localizedParameterRows(rows,locale=uiLanguage,labels=typeof project==='undefined'?[]:project.nodes.map(n=>n.label).filter(Boolean)){return rows.map(row=>{const label=labels.find(label=>row.description.startsWith(label+' · '));return {...row,phase:translatedText(row.phase,locale),description:label?label+translatedText(row.description.slice(label.length),locale):translatedText(row.description,locale),source:locale==='uk'?row.source:String(row.source).replace(/с\.([\d,;–-]+)/g,(_m,list)=>(locale==='en'?'p.':'str.')+[...new Set(list.split(/[,;–-]/).flatMap(n=>MANUAL_LOCALES[locale].pages[Number(n)]||[Number(n)]))].join(','))};});}

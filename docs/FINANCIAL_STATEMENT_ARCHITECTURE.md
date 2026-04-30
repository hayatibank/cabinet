# Financial Statement Architecture

Дата: 2026-04-22

Этот документ фиксирует текущее устройство финансового отчета в `cabinet.hayatibank.ru`, канонические статьи, Firestore-схему, объекты данных и целевую связку с `money.hayatibank.ru`.

## 1. Главная идея

Внутри кабинета финансовый отчет должен жить в трех логических режимах:

- `snapshot`
- `fact`
- `plan`

На текущий момент:

- `snapshot` является дефолтным режимом кабинета
- секции, totals и analysis остаются захардкоженными в UI
- сами статьи подсекций вынесены в справочник Firestore

Это означает:

- состав строк отчета больше не должен определяться локальным хардкодом в нескольких файлах
- ручной ввод в кабинете пишет в `snapshot_*`
- будущая автосборка из `money` должна писать в `fact_*` и `plan_*`

## 2. Канонический источник статей

### 2.1. Firestore path

```text
referenceBooksCabinet/financialStatementInputItemsIndividualDefault/items/{docId}
```

`docId` канонически строится из `reportCode`:

- `A.1 -> A_1`
- `1.5 -> 1_5`
- `N.8 -> N_8`

### 2.2. Назначение

Этот справочник хранит только входные статьи отчета.

Он не хранит:

- заголовки секций
- итоговые строки
- analysis

### 2.3. Формат документа статьи

```json
{
  "status": "active",
  "createdAt": "timestamp|string",
  "label": {
    "en": "Transport (incl. installments)",
    "ru": "Транспорт (вкл. рассрочки)",
    "ar": "Transport (incl. installments)"
  },
  "reportSection": "expenses",
  "reportSubsection": "main",
  "reportCode": "1.5",
  "order": 250
}
```

### 2.4. Смысл полей

`status`

- статус статьи
- сейчас используется `active`

`createdAt`

- дата создания записи справочника
- нужна как служебное поле и для аудита

`label`

- локализованное название статьи
- формат: `map { en, ru, ar }`

`reportSection`

- верхний раздел отчета
- допустимые значения:
  - `income`
  - `expenses`
  - `assets`
  - `liabilities`

`reportSubsection`

- подсекция внутри раздела
- допустимые значения сейчас:
  - `income`: `earned`, `passive`, `portfolio`
  - `expenses`: `preliminary`, `main`
  - `assets`: `factual`, `luxury`
  - `liabilities`: `main`

`reportCode`

- код строки отчета
- это главный бизнес-идентификатор статьи

`order`

- технический порядок вывода
- не зависит от локализации

## 3. Текущие канонические статьи

## 3.1. Income

### `earned`

- `A.1` Salary #1
- `A.2` Salary #2
- `A.3` Other earned income

### `passive`

- `C.1` Business (NET)
- `C.2` Real estate (NET)
- `C.3` Other passive income

### `portfolio`

- `E.1` Long-term investing
- `E.2` Investment projects
- `E.3` Other portfolio income

## 3.2. Expenses

### `preliminary`

- `0.1` Investments
- `0.2` Savings
- `0.3` Charity
- `0.4` Pocket money
- `0.5` Entertainment
- `0.6` Taxes

### `main`

- `1.1` Food
- `1.2` Marriage
- `1.3` Housing (installment/rent + utilities)
- `1.4` Wardrobe
- `1.5` Transport (incl. installments)
- `1.6` Communications
- `1.7` Fitness
- `1.8` Hobbies
- `1.9` Health
- `1.10` Children
- `1.11` Other installments
- `1.12` Personal loans
- `1.13` Other debts
- `1.14` Other expenses

## 3.3. Assets

### `factual`

- `N.1` Bank accounts
- `N.2` Cash
- `N.3` Digital assets
- `N.4` Accounts receivable
- `N.5` Portfolio
- `N.6` Business (valuation, NET)
- `N.7` Real estate (minus installments)
- `N.8` Other assets

### `luxury`

- `P.1` Home(s)
- `P.2` Car(s)
- `P.3` Other luxury

## 3.4. Liabilities

### `main`

- `T.1` Housing installments
- `T.2` Transport installments
- `T.3` Other installments
- `T.4` Personal loans
- `T.5` Other debts
- `T.6` Other liabilities

## 4. Cabinet Firestore layout

## 4.1. Snapshot collections

Для каждого аккаунта и года:

```text
accounts/{accountId}/fin_statements/{year}/snapshot_income_categories/{docId}
accounts/{accountId}/fin_statements/{year}/snapshot_exp_categories/{docId}
accounts/{accountId}/fin_statements/{year}/snapshot_asset_categories/{docId}
accounts/{accountId}/fin_statements/{year}/snapshot_liability_categories/{docId}
```

Это текущий дефолтный manual режим кабинета.

## 4.2. Планируемые collections для auto-fed режима

```text
accounts/{accountId}/fin_statements/{year}/fact_income_categories/{docId}
accounts/{accountId}/fin_statements/{year}/fact_exp_categories/{docId}
accounts/{accountId}/fin_statements/{year}/fact_asset_categories/{docId}
accounts/{accountId}/fin_statements/{year}/fact_liability_categories/{docId}

accounts/{accountId}/fin_statements/{year}/plan_income_categories/{docId}
accounts/{accountId}/fin_statements/{year}/plan_exp_categories/{docId}
accounts/{accountId}/fin_statements/{year}/plan_asset_categories/{docId}
accounts/{accountId}/fin_statements/{year}/plan_liability_categories/{docId}
```

## 4.3. Формат snapshot/fact/plan документа строки

Текущий snapshot-документ собирается в кабинете так:

```json
{
  "status": "active",
  "createdAt": "timestamp|string",
  "code": "N.5",
  "idx": 5,
  "order": 150,
  "reportSection": "assets",
  "reportSubsection": "factual",
  "groupCode": "N",
  "label": "Бизнес (оценка, NET)",
  "labelMap": {
    "en": "Business (valuation, NET)",
    "ru": "Бизнес (оценка, NET)",
    "ar": "Business (valuation, NET)"
  },
  "amount": 0,
  "updatedAt": "timestamp"
}
```

Ключевой момент:

- `code` это бизнес-координата строки
- `docId` это просто тех-форма `code.replace('.', '_')`

## 5. Что уже сделано в cabinet

## 5.1. Кодовые точки

### Справочник статей

[inputItemsReference.js](C:/dev/2.%20HayatiBank/website/production/cabinet.hayatibank.ru/finStatement/inputItemsReference.js)

Отвечает за:

- seed `financialStatementInputItemsIndividualDefault`
- чтение reference items
- нормализацию
- сбор snapshot-документов
- мягкую миграцию из `system_*` в `snapshot_*`

### Чтение отчета

[reportService.js](C:/dev/2.%20HayatiBank/website/production/cabinet.hayatibank.ru/finStatement/reportService.js)

Отвечает за:

- загрузку reference items
- `ensureSnapshotCollections(...)`
- чтение отчета из `snapshot_*`
- локализацию item labels
- analysis calculations

### Редактирование

[reportManager.js](C:/dev/2.%20HayatiBank/website/production/cabinet.hayatibank.ru/finStatement/reportManager.js)

Отвечает за:

- открытие edit modal
- чтение текущего значения из `snapshot_*`
- сохранение в `snapshot_*`
- защиту от двойного открытия модалки

## 5.2. Миграция старых данных

Ранее manual-ввод писал в:

```text
system_income_categories
system_exp_categories
system_asset_categories
system_liability_categories
```

Теперь:

- при загрузке отчета cabinet seed’ит недостающие `snapshot_*`
- если в старых `system_*` есть актуальные коды, их суммы переносятся в `snapshot_*`
- legacy-коды, не входящие в каноническую схему, не должны мигрировать дальше

### Особый случай по активам

После добавления `N.3 = Digital assets` старая форма `N.3..N.7` стала смещенной.

Для этого в migration-логике есть сдвиг старого хвоста:

- old `N.3 -> new N.4`
- old `N.4 -> new N.5`
- old `N.5 -> new N.6`
- old `N.6 -> new N.7`
- old `N.7 -> new N.8`

Это нужно, чтобы старые данные типа `Бизнес`, `Недвижимость`, `Прочие активы` не превратились ошибочно в `Digital assets`.

## 6. Что такое snapshot / fact / plan

`snapshot`

- ручной ввод “картины сразу”
- дефолтный режим кабинета
- нужен для пользователей без `Hayati Money`

`fact`

- собирается автоматически из реальных регистраций
- основной кандидат-источник: `money transactions`
- позже: `assets`, другие предметные модули

`plan`

- собирается автоматически из плановых регистраций
- основной кандидат-источник: `money planned items`

## 7. Связка с money.hayatibank.ru

## 7.1. Текущее устройство money

На стороне функций `money` сейчас используются:

### Директории

- `money_income_categories`
- `money_expense_categories`

### Операции

- `money_transactions`
- `money_planned_items`

Ключевые функции:

[money/index.js](C:/dev/2.%20HayatiBank/website/development/functions-for.hayatibank.ru/money/index.js)

- `normalizeTransaction`
- `createTransaction`
- `updateTransaction`
- `deleteTransaction`
- `normalizePlannedItem`
- `createPlannedItem`
- `updatePlannedItem`
- `deletePlannedItem`
- `postPlannedItem`

## 7.2. Текущий объект transaction

Нормализованная transaction содержит, среди прочего:

```json
{
  "type": "income|expense|transfer|debt",
  "amount": 1000,
  "currency": "RUB",
  "walletId": "...",
  "walletAccountId": "...",
  "categoryId": "...",
  "categoryType": "income|expense",
  "operationDate": "timestamp",
  "note": "",
  "source": "web|planned|...",
  "plannedItemId": "",
  "status": "active"
}
```

## 7.3. Текущий объект planned item

Нормализованный planned item содержит:

```json
{
  "uid": "...",
  "accountId": "...",
  "type": "income|expense",
  "amount": 1000,
  "currency": "RUB",
  "walletId": "...",
  "walletAccountId": "...",
  "categoryId": "...",
  "categoryType": "income|expense",
  "plannedDate": "timestamp",
  "note": "",
  "preferredBankCardId": "",
  "recurrenceRuleId": "",
  "source": "manual",
  "status": "planned|posted|skipped|deleted",
  "transactionId": ""
}
```

## 7.4. Что нужно добавить в money

Чтобы `money` начал кормить financial report, нужно добавить в операции и planned items как минимум:

- `reportCode`
- желательно еще `referenceItemId`

Минимальный практичный вариант:

```json
{
  "categoryId": "transport",
  "reportCode": "1.5"
}
```

Лучший вариант:

```json
{
  "categoryId": "transport",
  "referenceItemId": "1_5",
  "reportCode": "1.5"
}
```

## 7.5. Когда писать fact_*

Писать `fact_*` нужно на стороне backend `money` в моменты:

- `createTransaction`
- `updateTransaction`
- `deleteTransaction`

Логика:

- на create: увеличить агрегат по `reportCode`
- на update: пересчитать старый и новый вклад
- на delete: снять вклад из агрегата

## 7.6. Когда писать plan_*

Писать `plan_*` нужно в моменты:

- `createPlannedItem`
- `updatePlannedItem`
- `deletePlannedItem`

`postPlannedItem` не должен дублировать `plan_*`.

Он должен:

- создавать обычную transaction
- а уже `createTransaction`/`fact`-логика отработает отдельно

## 7.7. Нужна ли ссылка из fin_statements обратно в transaction

Текущее видение: нет, не нужна.

Причина:

- целевой отчетный документ детерминирован
- он вычисляется из:
  - `year`
  - `kind` (`snapshot|fact|plan`)
  - `reportSection`
  - `reportCode`

То есть документ отчета не должен быть “владельцем” операции.

Лучше хранить в самой операции:

- `reportCode`
- `referenceItemId`

А агрегатный документ строить детерминированно:

```text
accounts/{accountId}/fin_statements/{year}/fact_exp_categories/1_5
```

## 7.8. Практическая рекомендация по интеграции money

Лучший следующий шаг:

1. В `money_income_categories` и `money_expense_categories` добавить поле:
   - `reportCode`
   - опционально `referenceItemId`

2. В формы создания операции и planned item прокинуть это значение в payload.

3. На backend `money` сделать агрегатор:
   - transaction -> `fact_*`
   - planned item -> `plan_*`

4. В кабинете позже добавить переключатель источника:
   - `Snapshot`
   - `Fact`
   - `Plan`

## 8. Что считать каноничным на сегодня

Канонично сейчас следующее:

- справочник статей: `financialStatementInputItemsIndividualDefault`
- ручной режим кабинета: `snapshot_*`
- `snapshot` это дефолтный режим кабинета
- `fact` и `plan` еще не запитаны из `money`, но целевая схема уже определена

Неканонично и подлежит уходу:

- локальные дубли структур статей в разных js-файлах
- старые `system_*` как основной источник
- любые legacy-коды вне текущего списка статей

## 9. Следующие практические шаги

### Для cabinet

- добавить явный режим источника отчета: `snapshot|fact|plan`
- по умолчанию оставлять `snapshot`

### Для money

- расширить directory categories полями `reportCode/referenceItemId`
- прокинуть их в transaction/planned item
- агрегировать в `fact_*` и `plan_*`

### Для assets / других модулей

- писать либо directly в `fact_asset_categories`
- либо в собственные записи с последующей агрегацией в `fact_*`

## 10. Golden rule

Состав строк отчета должен жить в одном справочнике.

Суммы должны жить отдельно по режимам:

- `snapshot`
- `fact`
- `plan`

UI кабинета должен только:

- выбирать источник
- читать агрегаты
- позволять ручное редактирование только в `snapshot`

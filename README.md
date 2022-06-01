# JS Библиотека сайтов СП

Это библиотека для Node.js для упрощения API сайтов СП. Документация к API [тут](https://github.com/sp-worlds/api-docs).

## Установка

Вы можете установить эту библиотеку при помощи
`npm` или альтернативного пакетного менеджера (`pnpm`, `yarn`).

```
npm i spworlds
```

## Использование

```js
import SPWorlds from 'spworlds';
// const SPWorlds = require('spworlds');

// Где получить ID и токен - https://github.com/sp-worlds/api-docs/blob/main/AUTHORIZATION.md#%D0%BF%D0%BE%D0%BB%D1%83%D1%87%D0%B5%D0%BD%D0%B8%D0%B5-%D1%82%D0%BE%D0%BA%D0%B5%D0%BD%D0%B0-%D0%B8-id-%D0%BA%D0%B0%D1%80%D1%82%D1%8B
const api = new SPWorlds('ID карты', 'Токен карты');
```

## Использование

### Инициализировать платежную форму

Если вы хотите принимать оплату в АРах на своем сайте, используйте этот метод.

Получение ссылки на страницу оплаты 16 АР, после успешной оплаты пользователь перейдет со страницы оплаты на `https://eximple.com/success`, а сайт СП отправит запрос на `https://api.example.com/webhook` с данными этого платежа, в том числе и `SomeString`. Последнее поле можно использовать, например, для ID заказа или чего-то подобного.

```js
const url = await api.initPayment(
  16,
  'https://eximple.com/success',
  'https://api.example.com/webhook',
  'SomeString'
);
```

### Перевод АРов на другую карту

Перевод 16 АР на карту с номером 11111 и комментарием "С днем рождения!"

```js
api.createTransaction('11111', 16, 'С днем рождения!');
```

### Получение ника игрока

Метод принимает ID игрока в Discord и возвращает его ник, если у него есть вход на сервер.

```js
const username = await api.findUser('111111111111111111');

if (!username) throw 'У этого игрока нет проходки';
```

### Подтверждение вебхука

Проверка хеша из `req.headers['X-Body-Hash']` на валидность. Если метод возвращает не true, не обрабатывайте этот запрос.

```js
const isValid = api.verifyHash(req.body, req.headers['X-Body-Hash']);

if (!isValid) throw 'Ошибка проверки цифровой подписи';
```

## Contributing

Если вы хотите дополнить или улучшить библиотеку или документацию к ней, то сделайте pull запрос к этому репозиторию. Пожалуйста, используйте [pnpm](https://pnpm.io/) вместо npm и форматируйте js и ts код при помощи [prettier](https://prettier.io/), чтобы все было красиво.

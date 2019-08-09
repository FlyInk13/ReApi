# ReApi

### Disclaimer
Проект был написан в 2017 году.  
Исходники опубликованы после косметических работ без проверки работоспособности.  
PS: В репозитории отсутствует vk-crypto.js - его можно сделать из [FlyVK](https://k-94.ru/FlyVK/libs/crypto.js)

### Что это?
Сторонний API сервер для официального клиента для ВКонтакте ниже 5й версии.

### Как это работает? 
1. Поднимаем сервер: [ReApi.js:138](https://github.com/FlyInk13/ReApi/blob/master/ReApi.js#L138)
2. Ловим запрос при авторизации и вырезаем sig, для возможности подмены запроса
    1. Ловим запрос  [ReApi.js:42](https://github.com/FlyInk13/ReApi/blob/master/ReApi.js#L42) 
    2. Вырезаем nohttps [auth.js:41](https://github.com/FlyInk13/ReApi/blob/master/libs/auth.js#L41)
3. Ловим и заменяем запросы 
    1. Загружаем настройки пользователя: [ReApi.js:65](https://github.com/FlyInk13/ReApi/blob/master/ReApi.js#L65)
    2. Ищем модули у которых есть обработчик для замены запроса: [ReApi.js:67](https://github.com/FlyInk13/ReApi/blob/master/ReApi.js#L67)
    3. Прогоняем через все модули, заменяя запрос: [ReApi.js:71](https://github.com/FlyInk13/ReApi/blob/master/ReApi.js#L71)
    4. Выполняем запрос: [ReApi.js:82](https://github.com/FlyInk13/ReApi/blob/master/ReApi.js#L82)
    5. Ищем модули у которых есть обработчик для замены ответа: [ReApi.js:100](https://github.com/FlyInk13/ReApi/blob/master/ReApi.js#L100)
    6. Прогоняем через все модули, заменяя ответ: [ReApi.js:101](https://github.com/FlyInk13/ReApi/blob/master/ReApi.js#L101)

### [Модули](https://github.com/FlyInk13/ReApi/tree/master/libs)
1. [bot.js](https://github.com/FlyInk13/ReApi/blob/master/libs/abot.js) - Замены при отправке сообщения
    * @a [поисковая фраза] - поиск и отправка аудио
    * @g [поисковая фраза] - поиск и отправка gif из поиска по документам
    * [ссылка на youtube] - загрузка и отправка видео и youtube
    * [ссылка на изображение] - загрузка и отправка изображения
    * [ссылка на instagram] - загрузка и отправка изображения
2. [audio.js](https://github.com/FlyInk13/ReApi/blob/master/libs/audio.js) - Костыль для музыки
3. [auth.js](https://github.com/FlyInk13/ReApi/blob/master/libs/auth.js) - Модуль авторизации
    * Вырезает sig при авторизации
    * Авторизация по токену (null - логин; токен - пароль)
3. [autoUsersAdd.js](https://github.com/FlyInk13/ReApi/blob/master/libs/autoUsersAdd.js) - Автоматическое принятие заявки в группу проекта
3. [ban_way.js](https://github.com/FlyInk13/ReApi/blob/master/libs/ban_way.js) - Подлядывание за ЧС от имени другого пользователя
3. [cmds.js](https://github.com/FlyInk13/ReApi/blob/master/libs/cmds.js) - Команды администратора
3. [counters.js](https://github.com/FlyInk13/ReApi/blob/master/libs/counters.js) - Накрутка счетчиков
3. [custom_keywords.js](https://github.com/FlyInk13/ReApi/blob/master/libs/custom_keywords.js) - Дополнительные подсказки стикеров
3. [docsKeywords.js](https://github.com/FlyInk13/ReApi/blob/master/libs/docsKeywords.js) - Подсказки к документам
3. [downloadaudio.js](https://github.com/FlyInk13/ReApi/blob/master/libs/downloadaudio.js) - Скачивание аудио через поиск диалога "reapi:ad"
3. [drawGraffitiPackBg.js](https://github.com/FlyInk13/ReApi/blob/master/libs/drawGraffitiPackBg.js) - Отрисовка фона граффити-набора
3. [graffiti_packs.js](https://github.com/FlyInk13/ReApi/blob/master/libs/graffiti_packs.js) - Наборы фейковых граффити
3. [important.js](https://github.com/FlyInk13/ReApi/blob/master/libs/important.js) - Важные сообщения
    * Вход через поиск "..." в диалогах
    * Ответ на сообщение через "+" - добавить в важные
    * Ответ на сообщение через "-" - удалить из важных
3. [longpoll.js](https://github.com/FlyInk13/ReApi/blob/master/libs/longpoll.js) - Прокси для longpoll
    * Шифрование @mp3, @inv, @cof
3. [main.js](https://github.com/FlyInk13/ReApi/blob/master/libs/main.js) - Загрузка настроек пользователя, вывод страницы настроек
3. [profile.js](https://github.com/FlyInk13/ReApi/blob/master/libs/profile.js) - Галочки, дата регистрации, id
3. [remove_ads.js](https://github.com/FlyInk13/ReApi/blob/master/libs/remove_ads.js) - Удаление рекламы, банеров, вставка банера новостей проекта
3. [replaceChatPhoto100.js](https://github.com/FlyInk13/ReApi/blob/master/libs/replaceChatPhoto100.js) - Отрисовка аватарок у пользователей без аватарок
3. [sendStickers.js](https://github.com/FlyInk13/ReApi/blob/master/libs/sendStickers.js) - Костыль для отправки граффити
3. [stickersSource.js](https://github.com/FlyInk13/ReApi/blob/master/libs/stickersSource.js) - Костыль для отрисовки граффити
3. [test.js](https://github.com/FlyInk13/ReApi/blob/master/libs/test.js) - Вывод дополнительных точек входа в настройки и разные тестовые фичи
3. [tograffiti.js](https://github.com/FlyInk13/ReApi/blob/master/libs/tograffiti.js) - Вывод сниппета в toGraffiti боте для быстрого добавления в документы
3. [voice2text.js](https://github.com/FlyInk13/ReApi/blob/master/libs/voice2text.js) - Расшифровка голосовых сообщений
3. [widget.js](https://github.com/FlyInk13/ReApi/blob/master/libs/widget.js) - Выввод виджетов групп у конкурентов


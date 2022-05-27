# TodoList

Контракт крестики-нолики.
Также в корне проекта должен быть файл .env содержащий PRIVATE_KEY - приватный ключ проекта Infura, и MNEMONIC - секретные слова от кошелька(те которые никто не должен узнать).<br/>
Эти два параметра нужны при деплое контракта в тестовую сеть Ropsten.<br/>
<br/>

## Развернутый контракт в Ropsten:<br/>

## Hardhat tasks:

Создать игру

```bash
$ npx hardhat createGame --days --hours --minutes
```

Присоединиться к игре. (--account) номер аккаунта из списка

```bash
$ npx hardhat joinGame --id (--account)
```

Посмотреть свободные игры

```bash
$ npx hardhat freeGames
```

Посмотреть игру по ID

```bash
$ npx hardhat getGame --id
```

Посмотреть свой знак(крестик или нолик) в выбранной игре и твой ли ход сейчас. (--account) номер аккаунта из списка

```bash
$ npx hardhat whoNext --id (--account)
```

Сделать ход. (--account) номер аккаунта из списка

```bash
$ npx hardhat makeMove --id --x --y (--account)
```

Посмотреть статистику игр.<br>
id=0 - Статистика побед нулей<br>
id=1 - Статистика побед крестиков<br>
id=2 - Статистика ничьев<br>

```bash
$ npx hardhat getStatistic --id
```

Посмотреть статистику по адресу.<br>
account - номер из списка signers

```bash
$ npx hardhat addressStatistic --account
```

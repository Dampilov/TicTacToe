# Контракты

TicTacToe - игра крестики-нолики.<br>
Wallet - Multisig Wallet<br>
ERC20Mock - ERC20 токен<br>

Также в корне проекта должен быть файл .env содержащий
<br/>

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

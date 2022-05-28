# Контракты

TicTacToe - игра крестики-нолики.<br>
Wallet - Multisig Wallet<br>
ERC20Mock - ERC20 токен<br>

# Адреса контрактов в Rinkeby

TicTacToe - 0x889cBcBbEFa0FEc058C70fDD38e7c8Cf1500aB19<br>
Wallet - 0x386D6fDB4785B709f6122BD69965560a148eAc83<br>
ERC20Mock - 0xce9Ce076CdBA678E36A1b650f3e691f12b137F9A<br>

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

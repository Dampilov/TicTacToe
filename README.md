# Контракты

TicTacToe - логический контракт игры крестики-нолики<br>
Wallet - Multisig Wallet<br>
ERC20Mock - ERC20 токен<br>
TicTacProxy - промежуточный контракт для игры<br>

# Адреса контрактов в Ropsten

Proxy - 0x2B92E7f9F9b9C4C3198D2959543250c460Cac03F<br>
Implementation - 0xB55557a3D74FC5cD0A1250c4C7E0aA76F5E7Ee78<br>
Wallet - 0x4F2e62fb00B5D07d411ee3da5A130f11Ee1F8861<br>
ERC20Mock - 0x42117f0822f6fA9c094a6c6a44D793B39ad9CDE7<br>

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

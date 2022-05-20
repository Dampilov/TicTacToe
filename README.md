# TodoList

Контракт крестики-нолики.
Также в корне проекта должен быть файл .env содержащий PRIVATE_KEY - приватный ключ проекта Infura, и MNEMONIC - секретные слова от кошелька(те которые никто не должен узнать).<br/>
Эти два параметра нужны при деплое контракта в тестовую сеть Ropsten.<br/>
<br/>

## Развернутый контракт в Ropsten:<br/>

name: "TicTacToe"<br>
address: 0x1071e8a2cbA02D81a4a3E910c3a9780E57027d17<br>
Deployer: 0x45C942FCe98eFf30b6002F7c2fC4860547B542c9<br>
tx: 0x159cd9ec543663f3e2dc5fb6a2adb0ed7a5531f6b39cbd4a712a3830596e184c)<br>
ChainId: 3<br>
gas used: 1 817 139<br>

## Hardhat tasks:

Создать игру

```bash
$ npx hardhat createGame --days --hours --minutes
```

Присоединиться к игре

```bash
$ npx hardhat joinGame --id
```

Посмотреть свободные игры

```bash
$ npx hardhat freeGames
```

Посмотреть игру по ID

```bash
$ npx hardhat getGame --id
```

Посмотреть свой знак (крестик или нолик) и твой ли ход сейчас. (--account) номер аккаунта из списка

```bash
$ npx hardhat whoNext --id "(--account)"
```

Сделать ход. (--account) номер аккаунта из списка

```bash
$ npx hardhat makeMove --id --x --y "(--account)"
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

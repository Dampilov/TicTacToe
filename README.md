# TodoList

Контракт крестики-нолики.
Также в корне проекта должен быть файл .env содержащий PRIVATE_KEY - приватный ключ проекта Infura, и MNEMONIC - секретные слова от кошелька(те которые никто не должен узнать).<br/>
Эти два параметра нужны при деплое контракта в тестовую сеть Ropsten.<br/>
<br/>

## Развернутый контракт в Ropsten:<br/>

## Ошибки

An unexpected error occurred:

Error: ERROR processing C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\deploy\ERC20Mock.ts:
ProviderError: contract creation code storage out of gas
at HttpProvider.request (C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\node_modules\hardhat\src\internal\core\providers\http.ts:74:19)
at HDWalletProvider.request (C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\node_modules\hardhat\src\internal\core\providers\accounts.ts:188:34)
at processTicksAndRejections (node:internal/process/task_queues:96:5)
at DeploymentsManager.executeDeployScripts (C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\node_modules\hardhat-deploy\src\DeploymentsManager.ts:1222:19)
at processTicksAndRejections (node:internal/process/task_queues:96:5)
at async DeploymentsManager.runDeploy (C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\node_modules\hardhat-deploy\src\DeploymentsManager.ts:1052:5)
at async SimpleTaskDefinition.action (C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\node_modules\hardhat-deploy\src\index.ts:422:5)
at async Environment.\_runTaskDefinition (C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\node_modules\hardhat\src\internal\core\runtime-environment.ts:217:14)
at async Environment.run (C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\node_modules\hardhat\src\internal\core\runtime-environment.ts:129:14)
at async SimpleTaskDefinition.action (C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\node_modules\hardhat-deploy\src\index.ts:568:32)
at async Environment.\_runTaskDefinition (C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\node_modules\hardhat\src\internal\core\runtime-environment.ts:217:14)
at async Environment.run (C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\node_modules\hardhat\src\internal\core\runtime-environment.ts:129:14)
at async SimpleTaskDefinition.action (C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\node_modules\hardhat-deploy\src\index.ts:653:5)

С указанным лимитом газа: 3 000 000
deploying "ERC20Mock"exceeds block gas limit {"name":"ProviderError","code":-32000,"\_isProviderError":true} ProviderError:
exceeds block gas limit
at HttpProvider.request (C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\node_modules\hardhat\src\internal\core\providers\http.ts:74:19)
at HDWalletProvider.request (C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\node_modules\hardhat\src\internal\core\providers\accounts.ts:182:36)
at processTicksAndRejections (node:internal/process/task_queues:96:5)
An unexpected error occurred:

Error: ERROR processing C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\deploy\ERC20Mock.ts:
ProviderError: exceeds block gas limit
at HttpProvider.request (C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\node_modules\hardhat\src\internal\core\providers\http.ts:74:19)
at HDWalletProvider.request (C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\node_modules\hardhat\src\internal\core\providers\accounts.ts:182:36)
at processTicksAndRejections (node:internal/process/task_queues:96:5)
at DeploymentsManager.executeDeployScripts (C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\node_modules\hardhat-deploy\src\DeploymentsManager.ts:1222:19)
at processTicksAndRejections (node:internal/process/task_queues:96:5)
at async DeploymentsManager.runDeploy (C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\node_modules\hardhat-deploy\src\DeploymentsManager.ts:1052:5)
at async SimpleTaskDefinition.action (C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\node_modules\hardhat-deploy\src\index.ts:422:5)
at async Environment.\_runTaskDefinition (C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\node_modules\hardhat\src\internal\core\runtime-environment.ts:217:14)
at async Environment.run (C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\node_modules\hardhat\src\internal\core\runtime-environment.ts:129:14)
at async SimpleTaskDefinition.action (C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\node_modules\hardhat-deploy\src\index.ts:568:32)
at async Environment.\_runTaskDefinition (C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\node_modules\hardhat\src\internal\core\runtime-environment.ts:217:14)
at async Environment.run (C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\node_modules\hardhat\src\internal\core\runtime-environment.ts:129:14)
at async SimpleTaskDefinition.action (C:\Users\danil\Desktop\projects\ilink\Solidity\TicTacToe\node_modules\hardhat-deploy\src\index.ts:653:5)

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

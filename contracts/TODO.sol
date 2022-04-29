// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

// @title Контракт списка задач

contract TodoList {
    // @dev completed - статус задачи(сделан, не сделан),
    // @dev inDeadline - для фиксирования задач, которые небыли выполнены вовремя
    // @dev timeLeft - таймер задачи (оставшееся время)
    struct Task {
        string name;
        bool completed;
        bool inDeadline;
        uint256 timeLeft;
    }

    Task[] public tasks;

    // @dev taskToOwner - (ID задачи => адрес пользователя, который создал задачу)
    mapping(uint256 => address) taskToOwner;

    modifier onlyOwner(uint256 _taskId) {
        require(msg.sender == taskToOwner[_taskId]);
        _;
    }

    // @notice начиная со второго параметра, это время, которое дается на выполнение задачи
    function createTask(
        string memory _name,
        uint256 _days,
        uint256 _hours,
        uint256 _seconds
    ) public {
        tasks.push(Task(_name, false, true, block.timestamp + (_days * 1 days) + (_hours * 1 hours) + (_seconds * 1 seconds)));
        taskToOwner[tasks.length - 1] = msg.sender;
    }

    function deleteTask(uint256 _taskId) public onlyOwner(_taskId) {
        delete tasks[_taskId];
        delete taskToOwner[_taskId];
    }

    function completeTask(uint256 _taskId) public onlyOwner(_taskId) {
        // @notice требование было сделано, чтобы зря не платить gas, если задача уже выполнена
        require(!tasks[_taskId].completed);
        tasks[_taskId].completed = true;
        // @dev проверка на то, что задача была выполнена за отведенное время
        if (block.timestamp > tasks[_taskId].timeLeft) tasks[_taskId].inDeadline = false;
    }

    function taskList() public view returns (Task[] memory) {
        return tasks;
    }

    function oneTask(uint256 _taskId) public view returns (Task memory) {
        return tasks[_taskId];
    }

    // @dev функция вычисляет процент выполненных вовремя задач того кто вызвал эту функцию
    function myStatistic() public view returns (uint256) {
        uint256 taskCounter = 0;
        uint256 completedInDeadlineCounter = 0;
        for (uint256 i = 0; i < tasks.length; i++) {
            if (tasks[i].completed && taskToOwner[i] == msg.sender) {
                taskCounter++;
                if (tasks[i].inDeadline) completedInDeadlineCounter++;
            }
        }
        return (completedInDeadlineCounter * 100) / taskCounter;
    }
}

import { subtask } from "hardhat/config"
import fs = require("fs")

subtask("read-address", "Read address of smart-contract from JSON file")
    .addParam("name", "Name of using contract")
    .setAction(async ({ name }) => {
        const addressFile = __dirname + "/../../build/deployments/localhost/" + name + ".json"

        if (!fs.existsSync(addressFile)) {
            console.error("You need to deploy in localhost network your contract first")
            return
        }

        const addressJson = fs.readFileSync(addressFile, { encoding: "utf8", flag: "r" })
        const address = JSON.parse(addressJson)

        return address.address
    })

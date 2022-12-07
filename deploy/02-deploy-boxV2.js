const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const isLocalNetwork = developmentChains.includes(network.name);

    log("-----------------------------------------");

    const boxV2 = await deploy("BoxV2", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations,
    });

    if (!isLocalNetwork && process.env.ETHERSCAN_API_KEY) {
        await verify(boxV2.address, []);
    }

    log("-----------------------------------------");
};

module.exports.tags = ["all", "box"];

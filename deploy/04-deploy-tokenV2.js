const { ethers, network, upgrades } = require("hardhat");
const {
    developmentChains,
    PROXY_DEPLOYMENT_TIMEOUT,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const fs = require("fs-extra");
const path = require("path");

module.exports = async ({ deployments }) => {
    const { log } = deployments;
    const isLocalNetwork = developmentChains.includes(network.name);

    log("-----------------------------------------");

    log(">>>>>> Reading proxy address...");
    const filepath = path.resolve(
        __dirname,
        "../constants/contractAddresses.json"
    );
    const addressesData = fs.readFileSync(filepath, { encoding: "utf-8" });
    const addressesRecords = JSON.parse(addressesData);

    const { chainId } = network.config;
    const proxyAddress = addressesRecords[chainId].MyTokenV1.proxy;

    log(">>>>>> Proxy address is:", proxyAddress);

    log(">>>>>> Upgrading proxy...");
    const MyTokenV2 = await ethers.getContractFactory("MyTokenV2");
    const proxy = await upgrades.upgradeProxy(proxyAddress, MyTokenV2, {
        timeout: PROXY_DEPLOYMENT_TIMEOUT,
    });

    log(">>>>>> Proxy upgraded at:", proxy.address);

    const myTokenV2Address = await upgrades.erc1967.getImplementationAddress(
        proxy.address
    );
    log(">>>>>> MyTokenV2 contract deployed at:", myTokenV2Address);

    const tokenProxy = await ethers.getContractAt("MyTokenV2", proxy.address);
    log(">>>>>> Token version with proxy is:", await tokenProxy.version());
    log(">>>>>> Token value is:", await tokenProxy.getValue());

    log(">>>>>> Incrementing value...");
    await tokenProxy.increment();
    log(">>>>>> Token value is:", await tokenProxy.getValue());

    if (!isLocalNetwork && process.env.ETHERSCAN_API_KEY) {
        await verify(proxy.address, []);
    }

    log(">>>>>> Saving deployment info...");

    const deploymentInfo = {
        proxy: proxy.address,
        contract: myTokenV2Address,
    };

    if (chainId in addressesRecords) {
        addressesRecords[chainId].MyTokenV2 = deploymentInfo;
    } else {
        addressesRecords[chainId] = {
            MyTokenV2: deploymentInfo,
        };
    }

    try {
        fs.writeFileSync(filepath, JSON.stringify(addressesRecords, null, 2));
        log(">>>>>> Save success!");
    } catch (error) {
        log(">>>>>> Save failed!");
        log(error);
    }
    log("-----------------------------------------");
};

module.exports.tags = ["all", "token"];

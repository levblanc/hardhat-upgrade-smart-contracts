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

    log(">>>>>> Deploying proxy...");
    const args = [1];
    const MyTokenV1 = await ethers.getContractFactory("MyTokenV1");
    const proxy = await upgrades.deployProxy(MyTokenV1, args, {
        timeout: PROXY_DEPLOYMENT_TIMEOUT,
        kind: "uups",
    });

    await proxy.deployed();
    log(">>>>>> Proxy deployed at:", proxy.address);

    const myTokenV1Address = await upgrades.erc1967.getImplementationAddress(
        proxy.address
    );
    log(">>>>>> MyTokenV1 contract deployed at:", myTokenV1Address);

    // We can interact with MyTokenV1 contract by
    // using both proxy & implementation addresses
    const tokenContract = await ethers.getContractAt(
        "MyTokenV1",
        myTokenV1Address
    );
    log(
        ">>>>>> Token version with contract is:",
        await tokenContract.version()
    );

    const tokenProxy = await ethers.getContractAt("MyTokenV1", proxy.address);
    log(">>>>>> Token version with proxy is:", await tokenProxy.version());

    if (!isLocalNetwork && process.env.ETHERSCAN_API_KEY) {
        await verify(proxy.address, []);
    }

    log(">>>>>> Saving deployment info...");
    const deploymentInfo = {
        proxy: proxy.address,
        contract: myTokenV1Address,
    };

    const filePath = path.resolve(
        __dirname,
        "../constants/contractAddresses.json"
    );

    let addressesRecords = {};

    if (!fs.existsSync(filePath)) {
        fs.createFileSync(filePath);
    } else {
        const fileData = fs.readFileSync(filePath, { encoding: "utf-8" });

        if (fileData.length) {
            addressesRecords = JSON.parse(fileData);
        }
    }

    const { chainId } = network.config;

    if (chainId in addressesRecords) {
        addressesRecords[chainId].MyTokenV1 = deploymentInfo;
    } else {
        addressesRecords[chainId] = {
            MyTokenV1: deploymentInfo,
        };
    }

    try {
        fs.writeFileSync(filePath, JSON.stringify(addressesRecords, null, 2));
        log(">>>>>> Save success!");
    } catch (error) {
        log(">>>>>> Save failed!");
        log(error);
    }

    log("-----------------------------------------");
};

module.exports.tags = ["all", "token"];

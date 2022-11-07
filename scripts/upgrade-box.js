const { ethers } = require("hardhat");

const upgrade = async () => {
    const boxProxyAdmin = await ethers.getContract("BoxProxyAdmin");
    const transparentProxy = await ethers.getContract("BoxV1_Proxy");

    const proxyBoxV1 = await ethers.getContractAt(
        "BoxV1",
        transparentProxy.address
    );

    const v1 = await proxyBoxV1.version();
    console.log(">>>>>>", v1.toString());

    const boxV2 = await ethers.getContract("BoxV2");
    const upgradeTx = await boxProxyAdmin.upgrade(
        transparentProxy.address,
        boxV2.address
    );

    await upgradeTx.wait(1);

    // Call functions at transparent proxy address
    // with BoxV2 ABI
    const proxyBoxV2 = await ethers.getContractAt(
        "BoxV2",
        transparentProxy.address
    );

    const v2 = await proxyBoxV2.version();
    console.log(">>>>>>", v2.toString());
};

upgrade()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

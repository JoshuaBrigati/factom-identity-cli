const fs = require('fs');
const { Entry, isValidEcPrivateAddress, composeEntry } = require('factom');
const { generateCoinbaseAddressUpdateEntry, generateEfficiencyUpdateEntry } = require('factom-identity-lib');


function generateEfficiencyUpdateScript(rootChainId, serverManagementSubchainId, efficiency, sk1, ecPrivateAddress, factomdInformation) {
    if (!isValidEcPrivateAddress(ecPrivateAddress)) {
        throw new Error(`Invalid private EC address ${ecPrivateAddress}`);
    }
    const entry = Entry.builder(generateEfficiencyUpdateEntry(rootChainId, serverManagementSubchainId, efficiency, sk1)).build();
    const composed = composeEntry(entry, ecPrivateAddress);
    const script = generateScript(`Updating identity [${rootChainId}] with efficiency [${efficiency}]`,
        composed.commit.toString('hex'), composed.reveal.toString('hex'), factomdInformation);
    fs.writeFileSync('update-efficiency.sh', script);
}

function generateCoinbaseAddressUpdateScript(rootChainId, fctAddress, sk1, ecPrivateAddress, factomdInformation) {
    if (!isValidEcPrivateAddress(ecPrivateAddress)) {
        throw new Error(`Invalid private EC address ${ecPrivateAddress}`);
    }

    const entry = Entry.builder(generateCoinbaseAddressUpdateEntry(rootChainId, fctAddress, sk1)).build();
    const composed = composeEntry(entry, ecPrivateAddress);
    const script = generateScript(`Updating identity [${rootChainId}] with coinbase address [${fctAddress}]`,
        composed.commit.toString('hex'), composed.reveal.toString('hex'), factomdInformation);
    fs.writeFileSync('update-coinbase-address.sh', script);
}

function generateScript(message, commit, reveal, factomdInformation) {
    let template = fs.readFileSync(`${__dirname}/bash-template/update.sh`).toString();
    template = template.replace('_HEADER_MESSAGE_', message);
    template = template.replace('_COMMIT_MESSAGE_', commit);
    template = template.replace('_REVEAL_MESSAGE_', reveal);
    template = template.replace('_HOST_', factomdInformation.host);
    template = template.replace('_PORT_', factomdInformation.port);
    return template;
}

module.exports = {
    generateEfficiencyUpdateScript,
    generateCoinbaseAddressUpdateScript
};
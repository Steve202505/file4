const crypto = require('crypto');

function generateTransactionId() {
    return `TRX-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
}

function generateWithdrawalId() {
    return `WDR-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
}

function testConcurrency(count = 10000) {
    const txIds = new Set();
    const wdrIds = new Set();
    let txCollisions = 0;
    let wdrCollisions = 0;

    console.log(`Testing ${count} generations...`);

    for (let i = 0; i < count; i++) {
        const txId = generateTransactionId();
        const wdrId = generateWithdrawalId();

        if (txIds.has(txId)) txCollisions++;
        if (wdrIds.has(wdrId)) wdrCollisions++;

        txIds.add(txId);
        wdrIds.add(wdrId);
    }

    console.log(`Results:`);
    console.log(`Transaction ID Collisions: ${txCollisions}`);
    console.log(`Withdrawal ID Collisions: ${wdrCollisions}`);

    if (txCollisions === 0 && wdrCollisions === 0) {
        console.log('✅ Uniqueness test passed!');
    } else {
        console.log('❌ Uniqueness test failed!');
    }
}

testConcurrency();

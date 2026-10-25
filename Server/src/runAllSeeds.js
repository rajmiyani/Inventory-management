const { exec } = require('child_process');
const path = require('path');

const seeds = [
    'src/seedMedicalData.js',
    'src/seedCustomers.js',
    'seedInvoices.js', // This one is in the root of backend
    'src/seedPurchases.js'
];

async function runSeed(seedPath) {
    return new Promise((resolve, reject) => {
        console.log(`Running seed: ${seedPath}...`);
        exec(`node ${seedPath}`, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error running ${seedPath}:`, error);
                return reject(error);
            }
            console.log(stdout);
            if (stderr) console.error(stderr);
            resolve();
        });
    });
}

async function runAll() {
    try {
        for (const seed of seeds) {
            await runSeed(seed);
        }
        console.log('All seeding operations completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Master seeding failed:', error);
        process.exit(1);
    }
}

runAll();

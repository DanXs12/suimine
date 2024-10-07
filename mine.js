import { SuiMaster } from 'suidouble';
import config from './config.js';
import Miner from './includes/Miner.js';
import FomoMiner from './includes/fomo/FomoMiner.js';

const run = async () => {
    const pk = config.pk;
    const chain = config.chain;

    if (!config.pk || !config.chain) {
        throw new Error('pk and chain parameters are required');
    }

    const suiMasterParams = {
        client: chain,
        debug: !!config.debug,
    };
    if (pk.indexOf('suiprivkey') === 0) {
        suiMasterParams.privateKey = pk;
    } else {
        suiMasterParams.pk = pk;
    }
    const suiMaster = new SuiMaster(suiMasterParams);
    await suiMaster.initialize();

    console.log('suiMaster connected as ', suiMaster.address);

    const miners = {};

    const doMine = async (minerInstance) => {
        while (true) {
            try {
                await minerInstance.mine();
            } catch (e) {
                console.error(e);
                console.log('restarting the miner instance...');
            }
            await new Promise((res) => setTimeout(res, 100));
        };
    };


    if (config.do.meta) {
        const miner = new Miner({
            suiMaster,
            packageId: config.packageId,
            blockStoreId: config.blockStoreId,
            treasuryId: config.treasuryId,
        });
        miners.meta = miner;
        doMine(miners.meta);
    };
    if (config.do.fomo) {
        const fomoMiner = new FomoMiner({
            suiMaster,
            packageId: config.fomo.packageId,
            configId: config.fomo.configId,
            buses: config.fomo.buses,
        });
        miners.fomo = fomoMiner;
        doMine(miners.fomo);
    };



    // // let i = 0;
    // // let balance = null;

    // while (true) {
    //     // await miner.printAdjustDifficultyEvents();
    //     await miner.mine();
    //     i = i + 1;
    //     // balance = await miner.getBTCBalance();
    //     // console.log('BTC balance: ', balance);

    //     // await miner.printAdjustDifficultyEvents();
    // }
};

run()
    .then(() => {
        console.error('running');
    });
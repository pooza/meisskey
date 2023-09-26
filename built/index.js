/**
 * Misskey Entry Point!
 */ "use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    processLabel: function() {
        return processLabel;
    },
    getWorkerStrategies: function() {
        return getWorkerStrategies;
    }
});
const _os = require("os");
const _cluster = require("cluster");
const _xev = require("xev");
const _logger = require("./services/logger");
const _serverstats = require("./daemons/server-stats");
const _queuestats = require("./daemons/queue-stats");
const _load = require("./config/load");
const _env = require("./env");
const _showmachineinfo = require("./misc/show-machine-info");
Error.stackTraceLimit = Infinity;
require('events').EventEmitter.defaultMaxListeners = 128;
if (process.env.UV_THREADPOOL_SIZE == null) {
    let uvThreadpoolSize = 4;
    const cpus = require('os').cpus().length; // some environments returns 0
    if (cpus > uvThreadpoolSize) uvThreadpoolSize = cpus;
    if (uvThreadpoolSize > 1024) uvThreadpoolSize = 1024;
    process.env.UV_THREADPOOL_SIZE = uvThreadpoolSize.toString();
}
const logger = new _logger.default('core', 'cyan');
const bootLogger = logger.createSubLogger('boot', 'magenta', false);
const clusterLogger = logger.createSubLogger('cluster', 'orange');
const ev = new _xev.default();
const workerIndex = {};
let processLabel = 'unknown';
/**
 * Init process
 */ function main() {
    //#region Load config
    const configLogger = bootLogger.createSubLogger('config');
    let config;
    try {
        config = (0, _load.default)();
    } catch (exception) {
        if (typeof exception === 'string') {
            configLogger.error(exception);
            process.exit(1);
        }
        if (exception.code === 'ENOENT') {
            configLogger.error('Configuration file not found', null, true);
            process.exit(1);
        }
        throw exception;
    }
    configLogger.succ('Loaded');
    //#endregion
    const st = getWorkerStrategies(config);
    processLabel = (()=>{
        if (st.disableClustering) {
            if (st.onlyServer) return 'standalone:server'; // serverのみを実行するstandalone process
            if (st.onlyQueue) return 'standalone:queue'; // queueのみを実行するstandalone process
            return 'standalone'; // server/queueを実行するstandalone process
        }
        if (_cluster.isMaster) return 'primary'; // workerをかかえるmaster process
        if (process.env.WORKER_TYPE === 'server') return 'server'; // serverのみを実行するworker process
        if (process.env.WORKER_TYPE === 'queue') return 'queue'; // serverのみを実行するworker process
        return 'worker'; // server/queuを実行するworker process
    })();
    process.title = `Misskey (${processLabel})`;
    if (st.disableClustering) {
        masterMain(config).then(()=>{
            ev.mount();
            if (!_env.envOption.noDaemons) {
                (0, _serverstats.default)();
                (0, _queuestats.default)();
            }
            workerMain(config).then(()=>{
                bootLogger.succ(`Now listening on ${config.socket || `${config.addr}:${config.port}`}`, undefined, true);
                // ユニットテストから起動された場合用
                if (process.send) {
                    process.send('ok');
                }
            });
        });
    } else if (_cluster.isMaster) {
        masterMain(config).then(()=>{
            ev.mount();
            if (!_env.envOption.noDaemons) {
                (0, _serverstats.default)();
                (0, _queuestats.default)();
            }
            spawnWorkers(config).then(()=>{
                bootLogger.succ(`Now listening on ${config.socket || `${config.addr}:${config.port}`}`, undefined, true);
                // ユニットテストから起動された場合用
                if (process.send) {
                    process.send('ok');
                }
            });
        });
    } else {
        workerMain(config);
    }
}
function greet(config) {
    if (!_env.envOption.quiet && process.env.NODE_ENV !== 'test') {
        //#region Meisskey logo
        const v = `v${config.version}`;
        console.log(` 
 ______        _           _                
|  ___ \\      (_)         | |               
| | _ | | ____ _  ___  ___| |  _ ____ _   _ 
| || || |/ _  ) |/___)/___) | / ) _  ) | | |
| || || ( (/ /| |___ |___ | |< ( (/ /| |_| |
|_||_||_|\\____)_(___/(___/|_| \\_)____)\\__  |
                                     (____/ `);
        console.log(' ' + v);
        //#endregion
        console.log('');
        console.log(`< ${_os.hostname()} (PID: ${process.pid.toString()}) >`);
    }
    bootLogger.info('Welcome to Meisskey!');
    bootLogger.info(`Meisskey v${config.version}`, undefined, true);
}
/**
 * Init master process
 */ async function masterMain(config) {
    try {
        // initialize app
        await init(config);
        greet(config);
        if (config.port == null) {
            bootLogger.error('The port is not configured. Please configure port.', null, true);
            process.exit(1);
        }
    } catch (e) {
        bootLogger.error('Fatal error occurred during initialization', null, true);
        process.exit(1);
    }
    bootLogger.succ('Meisskey initialized');
}
/**
 * Init worker process
 */ async function workerMain(config) {
    const workerType = process.env.WORKER_TYPE;
    const st = getWorkerStrategies(config);
    if (st.disableClustering) {
        if (st.onlyServer) {
            await require('./server').default();
        } else if (st.onlyQueue) {
            await require('./queue').default();
        } else {
            await require('./server').default();
            await require('./queue').default();
        }
    } else {
        if (workerType === 'server') {
            await require('./server').default();
        } else if (workerType === 'queue') {
            await require('./queue').default();
        } else {
            await require('./server').default();
            await require('./queue').default();
        }
    }
    if (_cluster.isWorker) {
        // Send a 'ready' message to parent process
        if (process.send) {
            process.send('ready');
        }
    }
    setInterval(()=>{
        var _config_workerStrategies, _config_workerStrategies1, _config_workerStrategies2;
        const restartMin = workerType === 'server' ? (_config_workerStrategies = config.workerStrategies) === null || _config_workerStrategies === void 0 ? void 0 : _config_workerStrategies.serverWorkerRestartMin : workerType === 'queue' ? (_config_workerStrategies1 = config.workerStrategies) === null || _config_workerStrategies1 === void 0 ? void 0 : _config_workerStrategies1.queueWorkerRestartMin : (_config_workerStrategies2 = config.workerStrategies) === null || _config_workerStrategies2 === void 0 ? void 0 : _config_workerStrategies2.workerWorkerRestartMin;
        if (restartMin && restartMin > 0) {
            const uptimeMin = process.uptime() / 60;
            if (uptimeMin > restartMin) {
                clusterLogger.info(`${workerType} ${process.pid}: uptime limit exceeded ${uptimeMin.toFixed(2)} > ${restartMin}, exiting.`);
                process.exit(0);
            }
        }
    }, 60 * 1000);
}
const runningNodejsVersion = process.version.slice(1).split('.').map((x)=>parseInt(x, 10));
function showEnvironment() {
    const env = process.env.NODE_ENV;
    const logger = bootLogger.createSubLogger('env');
    logger.info(typeof env == 'undefined' ? 'NODE_ENV is not set' : `NODE_ENV: ${env}`);
    if (env !== 'production') {
        logger.warn('The environment is not in production mode.');
        logger.warn('DO NOT USE FOR PRODUCTION PURPOSE!', undefined, true);
    }
}
/**
 * Init app
 */ async function init(config) {
    showEnvironment();
    const nodejsLogger = bootLogger.createSubLogger('nodejs');
    nodejsLogger.info(`Version ${runningNodejsVersion.join('.')}`);
    await (0, _showmachineinfo.showMachineInfo)(bootLogger);
}
async function spawnWorkers(config) {
    const st = getWorkerStrategies(config);
    bootLogger.info(`Starting ${st.workers} worker processes`);
    const workerWorkers = await Promise.all([
        ...Array(st.workers)
    ].map(()=>spawnWorker('worker')));
    for (const worker of workerWorkers)workerIndex[worker.id] = 'worker';
    bootLogger.info(`Starting ${st.servers} server processes`);
    const serverWorkers = await Promise.all([
        ...Array(st.servers)
    ].map(()=>spawnWorker('server')));
    for (const worker of serverWorkers)workerIndex[worker.id] = 'server';
    bootLogger.info(`Starting ${st.queues} queue processes`);
    const queueWorkers = await Promise.all([
        ...Array(st.queues)
    ].map(()=>spawnWorker('queue')));
    for (const worker of queueWorkers)workerIndex[worker.id] = 'queue';
    bootLogger.succ('All workers started');
}
function getWorkerStrategies(config) {
    let workers = 0;
    let servers = 0;
    let queues = 0;
    let disableClustering = false;
    if (config.workerStrategies) {
        workers = config.workerStrategies.workerWorkerCount || 0;
        servers = config.workerStrategies.serverWorkerCount || 0;
        queues = config.workerStrategies.queueWorkerCount || 0;
    }
    if (workers + servers + queues === 0) disableClustering = true;
    if (_env.envOption.disableClustering) disableClustering = true;
    const onlyServer = _env.envOption.onlyServer;
    const onlyQueue = _env.envOption.onlyQueue;
    return {
        workers,
        servers,
        queues,
        disableClustering,
        onlyServer,
        onlyQueue
    };
}
function spawnWorker(type = 'worker') {
    return new Promise((res, rej)=>{
        const worker = _cluster.fork({
            WORKER_TYPE: type
        });
        worker.on('message', (message)=>{
            if (message === 'listenFailed') {
                bootLogger.error(`The server Listen failed due to the previous error.`);
                process.exit(1);
            }
            if (message !== 'ready') return rej();
            res(worker);
        });
    });
}
//#region Events
// Listen new workers
_cluster.on('fork', (worker)=>{
    clusterLogger.debug(`Process forked: [${worker.id}:${worker.process.pid}]`);
});
// Listen online workers
_cluster.on('online', (worker)=>{
    clusterLogger.debug(`Process is now online: [${worker.id}:${worker.process.pid}]`);
});
// Listen for dying workers
_cluster.on('exit', (worker)=>{
    // Replace the dead worker,
    // we're not sentimental
    const type = workerIndex[worker.id] || 'worker';
    const w = _cluster.fork({
        WORKER_TYPE: type
    });
    workerIndex[w.id] = type;
    clusterLogger.error(`[${worker.id}:${worker.process.pid}] died :(`);
});
// Display detail of unhandled promise rejection
if (!_env.envOption.quiet) {
    process.on('unhandledRejection', console.dir);
}
// Display detail of uncaught exception
process.on('uncaughtException', (err)=>{
    try {
        console.error(err);
    } catch (e) {}
});
// Dying away...
process.on('exit', (code)=>{
    logger.info(`The process is going to exit with code ${code}`);
});
//#endregion
main();

//# sourceMappingURL=index.js.map

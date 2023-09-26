"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return Logger;
    }
});
const _cluster = require("cluster");
const _os = require("os");
const _chalk = require("chalk");
const _datefns = require("date-fns");
const _env = require("../env");
const _log = require("../models/log");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
//import { processLabel } from '..';
const chalk = new _chalk.Instance(process.env.NODE_ENV === 'production' ? {
    level: 0
} : {});
let Logger = class Logger {
    createSubLogger(domain, color, store = false) {
        const logger = new Logger(domain, color, store);
        logger.parentLogger = this;
        return logger;
    }
    log(level, message, data, important = false, subDomains = [], store = false) {
        if (_env.envOption.quiet) return;
        //if (process.env.NODE_ENV === 'test') return;
        if (!this.store) store = false;
        if (this.parentLogger) {
            this.parentLogger.log(level, message, data, important, [
                this.domain
            ].concat(subDomains), store);
            return;
        }
        const time = (0, _datefns.format)(new Date(), 'HH:mm:ss');
        const worker = _cluster.isMaster ? '*' : _cluster.worker.id;
        const l = level === 'error' ? important ? chalk.bgRed.white('ERR ') : chalk.red('ERR ') : level === 'warning' ? chalk.yellow('WARN') : level === 'success' ? important ? chalk.bgGreen.white('DONE') : chalk.green('DONE') : level === 'debug' ? chalk.gray('VERB') : level === 'info' ? chalk.blue('INFO') : null;
        const domains = [
            this.domain
        ].concat(subDomains).map((d)=>d.color ? chalk.keyword(d.color)(d.name) : chalk.white(d.name));
        const m = level === 'error' ? chalk.red(message) : level === 'warning' ? chalk.yellow(message) : level === 'success' ? chalk.green(message) : level === 'debug' ? chalk.gray(message) : level === 'info' ? message : null;
        let log = `${l} ${worker}\t[${domains.join(' ')}]\t${m}`;
        if (_env.envOption.withLogTime) log = chalk.gray(time) + ' ' + log;
        //log = `${processLabel} ${process.pid} ` + log;
        console.log(important ? chalk.bold(log) : log);
        if (store) {
            _log.default.insert({
                createdAt: new Date(),
                machine: _os.hostname(),
                worker: worker,
                domain: [
                    this.domain
                ].concat(subDomains).map((d)=>d.name),
                level: level,
                message: message,
                data: data
            }).then(()=>{});
        }
    }
    error(x, data, important = false) {
        if (x instanceof Error) {
            data = data || {};
            data.e = x;
            this.log('error', x.toString(), data, important);
        } else if (typeof x === 'object') {
            this.log('error', `${x.message || x.name || x}`, data, important);
        } else {
            this.log('error', `${x}`, data, important);
        }
    }
    warn(message, data, important = false) {
        this.log('warning', message, data, important);
    }
    succ(message, data, important = false) {
        this.log('success', message, data, important);
    }
    debug(message, data, important = false) {
        if (process.env.NODE_ENV != 'production' || _env.envOption.verbose) {
            this.log('debug', message, data, important);
        }
    }
    info(message, data, important = false) {
        this.log('info', message, data, important);
    }
    constructor(domain, color, store = false){
        _define_property(this, "domain", void 0);
        _define_property(this, "parentLogger", null);
        _define_property(this, "store", void 0);
        this.domain = {
            name: domain,
            color: color
        };
        this.store = store;
    }
};

//# sourceMappingURL=logger.js.map

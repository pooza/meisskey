"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    //db.addMiddleware(logger);
    default: function() {
        return _default;
    },
    nativeDbConn: function() {
        return nativeDbConn;
    }
});
const _config = require("../config");
const _monk = require("monk");
const _mongodb = require("mongodb");
const u = _config.default.mongodb.user ? encodeURIComponent(_config.default.mongodb.user) : null;
const p = _config.default.mongodb.pass ? encodeURIComponent(_config.default.mongodb.pass) : null;
const path = _config.default.mongodb.path ? encodeURIComponent(_config.default.mongodb.path) : null;
const peer = path || `${_config.default.mongodb.host}:${_config.default.mongodb.port}`;
const uri = `mongodb://${u && p ? `${u}:${p}@` : ''}${peer}/${_config.default.mongodb.db}`;
const logger = (context)=>(next)=>(args, method)=>{
            var _args_col_s_namespace, _args_col_s, _args_col, _args;
            console.log(method, (_args = args) === null || _args === void 0 ? void 0 : (_args_col = _args.col) === null || _args_col === void 0 ? void 0 : (_args_col_s = _args_col.s) === null || _args_col_s === void 0 ? void 0 : (_args_col_s_namespace = _args_col_s.namespace) === null || _args_col_s_namespace === void 0 ? void 0 : _args_col_s_namespace.collection);
            return next(args, method).then((res)=>{
                //console.log(method + ' result', res)
                return res;
            });
        };
const db = (0, _monk.default)(uri, _config.default.mongodb.options || {});
const _default = db;
let mdb;
const nativeDbConn = async ()=>{
    if (mdb) return mdb;
    const db = await (()=>new Promise((resolve, reject)=>{
            _mongodb.MongoClient.connect(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }, (e, client)=>{
                if (e) return reject(e);
                resolve(client.db(_config.default.mongodb.db));
            });
        }))();
    mdb = db;
    return db;
};

//# sourceMappingURL=mongodb.js.map

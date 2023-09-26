"use strict";
Object.defineProperty(exports, "exportNotes", {
    enumerable: true,
    get: function() {
        return exportNotes;
    }
});
const _tmp = require("tmp");
const _fs = require("fs");
const _mongodb = require("mongodb");
const _logger = require("../../logger");
const _note = require("../../../models/note");
const _addfile = require("../../../services/drive/add-file");
const _user = require("../../../models/user");
const _datefns = require("date-fns");
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
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
const logger = _logger.queueLogger.createSubLogger('export-notes');
async function exportNotes(job) {
    logger.info(`Exporting notes of ${job.data.user._id} ...`);
    const user = await _user.default.findOne({
        _id: new _mongodb.ObjectID(job.data.user._id.toString())
    });
    if (user == null) {
        return `skip: user not found`;
    }
    // Create temp file
    const [path, cleanup] = await new Promise((res, rej)=>{
        _tmp.file((e, path, fd, cleanup)=>{
            if (e) return rej(e);
            res([
                path,
                cleanup
            ]);
        });
    });
    logger.info(`Temp file is ${path}`);
    const stream = _fs.createWriteStream(path, {
        flags: 'a'
    });
    await new Promise((res, rej)=>{
        stream.write('[', (err)=>{
            if (err) {
                logger.error(err);
                rej(err);
            } else {
                res();
            }
        });
    });
    let exportedNotesCount = 0;
    let cursor = null;
    const total = await _note.default.count({
        userId: user._id
    });
    while(true){
        const notes = await _note.default.find(_object_spread({
            userId: user._id
        }, cursor ? {
            _id: {
                $gt: cursor
            }
        } : {}), {
            limit: 100,
            sort: {
                _id: 1
            }
        });
        if (notes.length === 0) {
            job.progress(100);
            break;
        }
        cursor = notes[notes.length - 1]._id;
        for (const note of notes){
            const content = JSON.stringify(serialize(note));
            await new Promise((res, rej)=>{
                stream.write(exportedNotesCount === 0 ? content : ',\n' + content, (err)=>{
                    if (err) {
                        logger.error(err);
                        rej(err);
                    } else {
                        res();
                    }
                });
            });
            exportedNotesCount++;
        }
        job.progress(exportedNotesCount / total);
    }
    await new Promise((res, rej)=>{
        stream.write(']', (err)=>{
            if (err) {
                logger.error(err);
                rej(err);
            } else {
                res();
            }
        });
    });
    stream.end();
    logger.succ(`Exported to: ${path}`);
    const fileName = 'notes-' + (0, _datefns.format)(new Date(), 'yyyy-MM-dd-HH-mm-ss') + '.csv';
    const driveFile = await (0, _addfile.addFile)({
        user,
        path,
        name: fileName,
        force: true
    });
    cleanup();
    return `Exported to: ${driveFile._id}`;
}
function serialize(note) {
    return {
        id: note._id,
        text: note.text,
        createdAt: note.createdAt,
        fileIds: note.fileIds,
        replyId: note.replyId,
        renoteId: note.renoteId,
        poll: note.poll,
        cw: note.cw,
        viaMobile: note.viaMobile,
        visibility: note.visibility,
        visibleUserIds: note.visibleUserIds,
        appId: note.appId,
        geo: note.geo,
        localOnly: note.localOnly,
        copyOnce: !!note.copyOnce
    };
}

//# sourceMappingURL=export-notes.js.map

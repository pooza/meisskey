"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    deliver: function() {
        return deliver;
    },
    webpushDeliver: function() {
        return webpushDeliver;
    },
    inbox: function() {
        return inbox;
    },
    createDeleteNotesJob: function() {
        return createDeleteNotesJob;
    },
    createDeleteDriveFilesJob: function() {
        return createDeleteDriveFilesJob;
    },
    createDeleteNoteJob: function() {
        return createDeleteNoteJob;
    },
    createDeleteSigninsJob: function() {
        return createDeleteSigninsJob;
    },
    createExpireMuteJob: function() {
        return createExpireMuteJob;
    },
    createNotifyPollFinishedJob: function() {
        return createNotifyPollFinishedJob;
    },
    createExportNotesJob: function() {
        return createExportNotesJob;
    },
    createExportFollowingJob: function() {
        return createExportFollowingJob;
    },
    createExportMuteJob: function() {
        return createExportMuteJob;
    },
    createExportBlockingJob: function() {
        return createExportBlockingJob;
    },
    createExportUserListsJob: function() {
        return createExportUserListsJob;
    },
    createImportFollowingJob: function() {
        return createImportFollowingJob;
    },
    createImportBlockingJob: function() {
        return createImportBlockingJob;
    },
    createImportMuteJob: function() {
        return createImportMuteJob;
    },
    createImportUserListsJob: function() {
        return createImportUserListsJob;
    },
    default: function() {
        return _default;
    },
    destroy: function() {
        return destroy;
    }
});
const _config = require("../config");
const _queues = require("./queues");
const _getjobinfo = require("./get-job-info");
const _deliver = require("./processors/deliver");
const _webpushDeliver = require("./processors/webpushDeliver");
const _inbox = require("./processors/inbox");
const _db = require("./processors/db");
const _logger = require("./logger");
const _queue = require("../services/chart/queue");
const deliverLogger = _logger.queueLogger.createSubLogger('deliver');
const webpushDeliverLogger = _logger.queueLogger.createSubLogger('webpushDeliver');
const inboxLogger = _logger.queueLogger.createSubLogger('inbox');
const dbLogger = _logger.queueLogger.createSubLogger('db');
let deliverDeltaCounts = 0;
let inboxDeltaCounts = 0;
_queues.deliverQueue.on('waiting', (jobId)=>{
    deliverDeltaCounts++;
    deliverLogger.debug(`waiting id=${jobId}`);
}).on('active', (job)=>deliverLogger.info(`active ${(0, _getjobinfo.getJobInfo)(job, true)} to=${job.data.to}`)).on('completed', (job, result)=>deliverLogger.info(`completed(${result}) ${(0, _getjobinfo.getJobInfo)(job, true)} to=${job.data.to}`)).on('failed', (job, err)=>{
    const msg = `failed(${err}) ${(0, _getjobinfo.getJobInfo)(job)} to=${job.data.to}`;
    job.log(msg);
    deliverLogger.warn(msg);
}).on('error', (error)=>deliverLogger.error(`error ${error}`)).on('stalled', (job)=>deliverLogger.warn(`stalled ${(0, _getjobinfo.getJobInfo)(job)} to=${job.data.to}`));
_queues.webpushDeliverQueue.on('waiting', (jobId)=>{
    webpushDeliverLogger.debug(`waiting id=${jobId}`);
}).on('active', (job)=>webpushDeliverLogger.info(`active ${(0, _getjobinfo.getJobInfo)(job, true)} to=${job.data.pushSubscription.endpoint}`)).on('completed', (job, result)=>webpushDeliverLogger.info(`completed(${result}) ${(0, _getjobinfo.getJobInfo)(job, true)} to=${job.data.pushSubscription.endpoint}`)).on('failed', (job, err)=>{
    const msg = `failed(${err}) ${(0, _getjobinfo.getJobInfo)(job)} to=${job.data.pushSubscription.endpoint}`;
    job.log(msg);
    webpushDeliverLogger.warn(msg);
}).on('error', (error)=>webpushDeliverLogger.error(`error ${error}`)).on('stalled', (job)=>webpushDeliverLogger.warn(`stalled ${(0, _getjobinfo.getJobInfo)(job)} to=${job.data.pushSubscription.endpoint}`));
_queues.inboxQueue.on('waiting', (jobId)=>{
    inboxDeltaCounts++;
    inboxLogger.debug(`waiting id=${jobId}`);
}).on('active', (job)=>inboxLogger.info(`active ${(0, _getjobinfo.getJobInfo)(job, true)} activity=${job.data.activity ? job.data.activity.id : 'none'}`)).on('completed', (job, result)=>inboxLogger.info(`completed(${result}) ${(0, _getjobinfo.getJobInfo)(job, true)} activity=${job.data.activity ? job.data.activity.id : 'none'}`)).on('failed', (job, err)=>{
    const msg = `failed(${err}) ${(0, _getjobinfo.getJobInfo)(job)} activity=${job.data.activity ? job.data.activity.id : 'none'}`;
    job.log(msg);
    inboxLogger.warn(msg);
}).on('error', (error)=>inboxLogger.error(`error ${error}`)).on('stalled', (job)=>inboxLogger.warn(`stalled ${(0, _getjobinfo.getJobInfo)(job)} activity=${job.data.activity ? job.data.activity.id : 'none'}`));
_queues.dbQueue.on('waiting', (jobId)=>dbLogger.debug(`waiting id=${jobId}`)).on('active', (job)=>dbLogger.info(`${job.name} active ${(0, _getjobinfo.getJobInfo)(job, true)}`)).on('completed', (job, result)=>dbLogger.info(`${job.name} completed(${result}) ${(0, _getjobinfo.getJobInfo)(job, true)}`)).on('failed', (job, err)=>dbLogger.warn(`${job.name} failed(${err}) ${(0, _getjobinfo.getJobInfo)(job)}`)).on('error', (error)=>dbLogger.error(`error ${error}`)).on('stalled', (job)=>dbLogger.warn(`${job.name} stalled ${(0, _getjobinfo.getJobInfo)(job)}`));
// Chart bulk write
setInterval(()=>{
    if (deliverDeltaCounts === 0 && inboxDeltaCounts === 0) return;
    _queue.default.update(deliverDeltaCounts, inboxDeltaCounts);
    deliverDeltaCounts = 0;
    inboxDeltaCounts = 0;
}, 5000);
function deliver(user, content, to, lowSeverity = false, inboxInfo) {
    if (_config.default.disableFederation) return;
    const attempts = lowSeverity ? 2 : _config.default.deliverJobMaxAttempts || 12;
    if (content == null) return null;
    const data = {
        user: {
            _id: `${user._id}`,
            keypair: user.keypair
        },
        content,
        to,
        inboxInfo
    };
    return _queues.deliverQueue.add(data, {
        attempts,
        timeout: 1 * 60 * 1000,
        backoff: {
            type: 'apBackoff'
        },
        removeOnComplete: true,
        removeOnFail: true
    });
}
function webpushDeliver(data) {
    return _queues.webpushDeliverQueue.add(data, {
        attempts: 2,
        timeout: 1 * 60 * 1000,
        backoff: {
            type: 'apBackoff'
        },
        removeOnComplete: true,
        removeOnFail: true
    });
}
function inbox(activity, signature, request) {
    const data = {
        activity,
        signature,
        request
    };
    return _queues.inboxQueue.add(data, {
        attempts: _config.default.inboxJobMaxAttempts || 8,
        timeout: 5 * 60 * 1000,
        backoff: {
            type: 'apBackoff'
        },
        removeOnComplete: true,
        removeOnFail: true
    });
}
function createDeleteNotesJob(user) {
    return _queues.dbQueue.add('deleteNotes', {
        user: {
            _id: `${user._id}`
        }
    }, {
        timeout: 3 * 60 * 60 * 1000,
        removeOnComplete: true,
        removeOnFail: true
    });
}
function createDeleteDriveFilesJob(user) {
    return _queues.dbQueue.add('deleteDriveFiles', {
        user: {
            _id: `${user._id}`
        }
    }, {
        timeout: 3 * 60 * 60 * 1000,
        removeOnComplete: true,
        removeOnFail: true
    });
}
function createDeleteNoteJob(note, delay) {
    return _queues.dbQueue.add('deleteNote', {
        noteId: `${note._id}`
    }, {
        delay,
        timeout: 1 * 60 * 60 * 1000,
        removeOnComplete: true,
        removeOnFail: true
    });
}
function createDeleteSigninsJob(user, delay) {
    return _queues.dbQueue.add('deleteSignins', {
        user: {
            _id: `${user._id}`
        }
    }, {
        delay,
        timeout: 1 * 60 * 60 * 1000,
        removeOnComplete: true,
        removeOnFail: true
    });
}
function createExpireMuteJob(mute) {
    if (!mute.expiresAt) return;
    let delay = mute.expiresAt.getTime() - Date.now() + 1000;
    if (delay < 0) delay = 1000;
    return _queues.dbQueue.add('expireMute', {
        muteId: `${mute._id}`
    }, {
        delay,
        timeout: 5 * 60 * 1000,
        removeOnComplete: true,
        removeOnFail: true
    });
}
function createNotifyPollFinishedJob(note, user, expiresAt) {
    let delay = expiresAt.getTime() - Date.now() + 2000;
    if (delay < 0) delay = 2000;
    return _queues.dbQueue.add('notifyPollFinished', {
        noteId: `${note._id}`,
        userId: `${user._id}`
    }, {
        delay,
        timeout: 5 * 60 * 1000,
        removeOnComplete: true,
        removeOnFail: true
    });
}
function createExportNotesJob(user) {
    return _queues.dbQueue.add('exportNotes', {
        user: {
            _id: `${user._id}`
        }
    }, {
        timeout: 1 * 60 * 60 * 1000,
        removeOnComplete: true,
        removeOnFail: true
    });
}
function createExportFollowingJob(user) {
    return _queues.dbQueue.add('exportFollowing', {
        user: {
            _id: `${user._id}`
        }
    }, {
        timeout: 1 * 60 * 60 * 1000,
        removeOnComplete: true,
        removeOnFail: true
    });
}
function createExportMuteJob(user) {
    return _queues.dbQueue.add('exportMute', {
        user: {
            _id: `${user._id}`
        }
    }, {
        timeout: 1 * 60 * 60 * 1000,
        removeOnComplete: true,
        removeOnFail: true
    });
}
function createExportBlockingJob(user) {
    return _queues.dbQueue.add('exportBlocking', {
        user: {
            _id: `${user._id}`
        }
    }, {
        timeout: 1 * 60 * 60 * 1000,
        removeOnComplete: true,
        removeOnFail: true
    });
}
function createExportUserListsJob(user) {
    return _queues.dbQueue.add('exportUserLists', {
        user: {
            _id: `${user._id}`
        }
    }, {
        timeout: 1 * 60 * 60 * 1000,
        removeOnComplete: true,
        removeOnFail: true
    });
}
function createImportFollowingJob(user, fileId) {
    return _queues.dbQueue.add('importFollowing', {
        user: {
            _id: `${user._id}`
        },
        fileId: `${fileId}`
    }, {
        timeout: 1 * 60 * 60 * 1000,
        removeOnComplete: true,
        removeOnFail: true
    });
}
function createImportBlockingJob(user, fileId) {
    return _queues.dbQueue.add('importBlocking', {
        user: {
            _id: `${user._id}`
        },
        fileId: `${fileId}`
    }, {
        timeout: 1 * 60 * 60 * 1000,
        removeOnComplete: true,
        removeOnFail: true
    });
}
function createImportMuteJob(user, fileId) {
    return _queues.dbQueue.add('importMute', {
        user: {
            _id: `${user._id}`
        },
        fileId: `${fileId}`
    }, {
        timeout: 1 * 60 * 60 * 1000,
        removeOnComplete: true,
        removeOnFail: true
    });
}
function createImportUserListsJob(user, fileId) {
    return _queues.dbQueue.add('importUserLists', {
        user: {
            _id: `${user._id}`
        },
        fileId: `${fileId}`
    }, {
        timeout: 1 * 60 * 60 * 1000,
        removeOnComplete: true,
        removeOnFail: true
    });
}
function _default() {
    _queues.deliverQueue.process(_config.default.deliverJobConcurrency || 128, _deliver.default);
    _queues.webpushDeliverQueue.process(8, _webpushDeliver.default);
    _queues.inboxQueue.process(_config.default.inboxJobConcurrency || 16, _inbox.default);
    (0, _db.default)(_queues.dbQueue);
}
function destroy(domain) {
    if (domain == null || domain === 'deliver') {
        _queues.deliverQueue.once('cleaned', (jobs, status)=>{
            deliverLogger.succ(`Cleaned ${jobs.length} ${status} jobs`);
        });
        _queues.deliverQueue.clean(0, 'delayed');
    }
    if (domain == null || domain === 'inbox') {
        _queues.inboxQueue.once('cleaned', (jobs, status)=>{
            inboxLogger.succ(`Cleaned ${jobs.length} ${status} jobs`);
        });
        _queues.inboxQueue.clean(0, 'delayed');
    }
    if (domain === 'db') {
        _queues.dbQueue.once('cleaned', (jobs, status)=>{
            dbLogger.succ(`Cleaned ${jobs.length} ${status} jobs`);
        });
        _queues.dbQueue.clean(0, 'delayed');
    }
}

//# sourceMappingURL=index.js.map

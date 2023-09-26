"use strict";
Object.defineProperty(exports, "deleteSignins", {
    enumerable: true,
    get: function() {
        return deleteSignins;
    }
});
const _mongodb = require("mongodb");
const _logger = require("../../logger");
const _signin = require("../../../models/signin");
const logger = _logger.queueLogger.createSubLogger('delete-signins');
async function deleteSignins(job) {
    logger.info(`Deleting signins of ${job.data.user._id} ...`);
    const result = await _signin.default.remove({
        userId: new _mongodb.ObjectID(job.data.user._id.toString())
    });
    return `ok: Signins of ${job.data.user._id} has been deleted. (${result.deletedCount} records)`;
}

//# sourceMappingURL=delete-signins.js.map

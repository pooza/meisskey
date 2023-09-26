"use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _meta = require("../models/meta");
const defaultMeta = {
    name: 'Misskey',
    maintainer: {},
    langs: [],
    cacheRemoteFiles: false,
    localDriveCapacityMb: 256,
    remoteDriveCapacityMb: 8,
    hidedTags: [],
    blockedInstances: [],
    selfSilencedInstances: [],
    exposeHome: false,
    stats: {
    },
    maxNoteTextLength: 1000,
    enableEmojiReaction: true,
    enableTwitterIntegration: false,
    enableGithubIntegration: false,
    enableDiscordIntegration: false,
    mascotImageUrl: '/assets/ai.png',
    enableServiceWorker: false
};
async function _default() {
    const meta = await _meta.default.findOne({});
    return Object.assign({}, defaultMeta, meta);
}

//# sourceMappingURL=fetch-meta.js.map

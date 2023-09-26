"use strict";
Object.defineProperty(exports, /**
 * アナウンスアクティビティを捌きます
 */ "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _create = require("../../../../services/note/create");
const _type = require("../../type");
const _note = require("../../models/note");
const _logger = require("../../logger");
const _converthost = require("../../../../misc/convert-host");
const _applock = require("../../../../misc/app-lock");
const _instancemoderation = require("../../../../services/instance-moderation");
const _audience = require("../../audience");
const _date = require("../../misc/date");
const logger = _logger.apLogger;
async function _default(resolver, actor, activity, targetUri) {
    const uri = (0, _type.getApId)(activity);
    // アナウンサーが凍結か削除されていたらスキップ
    if (actor.isSuspended || actor.isDeleted) {
        return `skip: actor is suspended`;
    }
    // アナウンス先をブロックしてたら中断
    if (await (0, _instancemoderation.isBlockedHost)((0, _converthost.extractApHost)(uri))) return `skip: actor is blocked`;
    const unlock = await (0, _applock.getApLock)(uri);
    try {
        // 既に同じURIを持つものが登録されていないかチェック
        const exist = await (0, _note.fetchNote)(uri);
        if (exist) {
            return `skip: duplicate activity id`;
        }
        // Announce対象をresolve
        let renote;
        try {
            renote = await (0, _note.resolveNote)(targetUri, null, true);
        } catch (e) {
            return `skip: Ignored announce target: ${uri} => ${targetUri} - ${e.statusCode}`;
        }
        // skip unavailable
        if (renote == null) {
            return `skip: announce target is null: ${uri} => ${targetUri}`;
        }
        logger.info(`Creating the (Re)Note: ${uri}`);
        const activityAudience = await (0, _audience.parseAudience)(actor, activity.to, activity.cc);
        await (0, _create.default)(actor, {
            createdAt: (0, _date.parseDateWithLimit)(activity.published, 600 * 1000) || new Date(),
            renote,
            visibility: activityAudience.visibility,
            visibleUsers: activityAudience.visibleUsers,
            uri
        });
        return `ok`;
    } finally{
        unlock();
    }
}

//# sourceMappingURL=note.js.map

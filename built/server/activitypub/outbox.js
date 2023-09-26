"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return _default;
    },
    packActivity: function() {
        return packActivity;
    }
});
const _mongodb = require("mongodb");
const _config = require("../../config");
const _cafy = require("cafy");
const _cafyid = require("../../misc/cafy-id");
const _user = require("../../models/user");
const _renderer = require("../../remote/activitypub/renderer");
const _orderedcollection = require("../../remote/activitypub/renderer/ordered-collection");
const _orderedcollectionpage = require("../../remote/activitypub/renderer/ordered-collection-page");
const _activitypub = require("../activitypub");
const _note = require("../../models/note");
const _note1 = require("../../remote/activitypub/renderer/note");
const _create = require("../../remote/activitypub/renderer/create");
const _announce = require("../../remote/activitypub/renderer/announce");
const _array = require("../../prelude/array");
const _url = require("../../prelude/url");
const _default = async (ctx)=>{
    if (_config.default.disableFederation) ctx.throw(404);
    if (!_mongodb.ObjectID.isValid(ctx.params.user)) {
        ctx.status = 404;
        return;
    }
    const userId = new _mongodb.ObjectID(ctx.params.user);
    // Get 'sinceId' parameter
    const [sinceId, sinceIdErr] = _cafy.default.optional.type(_cafyid.default).get(ctx.request.query.since_id);
    // Get 'untilId' parameter
    const [untilId, untilIdErr] = _cafy.default.optional.type(_cafyid.default).get(ctx.request.query.until_id);
    // Get 'page' parameter
    const pageErr = !_cafy.default.optional.str.or([
        'true',
        'false'
    ]).ok(ctx.request.query.page);
    const page = ctx.request.query.page === 'true';
    // Validate parameters
    if (sinceIdErr || untilIdErr || pageErr || (0, _array.countIf)((x)=>x != null, [
        sinceId,
        untilId
    ]) > 1) {
        ctx.status = 400;
        return;
    }
    // Verify user
    const user = await _user.default.findOne({
        _id: userId,
        isDeleted: {
            $ne: true
        },
        isSuspended: {
            $ne: true
        },
        noFederation: {
            $ne: true
        },
        host: null
    });
    if (user == null) {
        ctx.status = 404;
        return;
    }
    const limit = 20;
    const partOf = `${_config.default.url}/users/${userId}/outbox`;
    if (page) {
        //#region Construct query
        const sort = {
            _id: -1
        };
        const query = {
            userId: user._id,
            visibility: {
                $in: [
                    'public',
                    'home'
                ]
            },
            localOnly: {
                $ne: true
            },
            copyOnce: {
                $ne: true
            }
        };
        if (sinceId) {
            sort._id = 1;
            query._id = {
                $gt: (0, _cafyid.transform)(sinceId)
            };
        } else if (untilId) {
            query._id = {
                $lt: (0, _cafyid.transform)(untilId)
            };
        }
        //#endregion
        const notes = await _note.default.find(query, {
            limit: limit,
            sort: sort
        });
        if (sinceId) notes.reverse();
        const activities = await Promise.all(notes.map((note)=>packActivity(note)));
        const rendered = (0, _orderedcollectionpage.default)(`${partOf}?${_url.query({
            page: 'true',
            since_id: sinceId,
            until_id: untilId
        })}`, user.notesCount, activities, partOf, notes.length ? `${partOf}?${_url.query({
            page: 'true',
            since_id: notes[0]._id.toHexString()
        })}` : null, notes.length ? `${partOf}?${_url.query({
            page: 'true',
            until_id: notes[notes.length - 1]._id.toHexString()
        })}` : null);
        ctx.body = (0, _renderer.renderActivity)(rendered);
        (0, _activitypub.setResponseType)(ctx);
    } else {
        // index page
        const rendered = (0, _orderedcollection.default)(partOf, user.notesCount, `${partOf}?page=true`, `${partOf}?page=true&since_id=000000000000000000000000`);
        ctx.body = (0, _renderer.renderActivity)(rendered);
        ctx.set('Cache-Control', 'public, max-age=180');
        (0, _activitypub.setResponseType)(ctx);
    }
};
async function packActivity(note) {
    if (note.renoteId && note.text == null && note.poll == null && (note.fileIds == null || note.fileIds.length == 0)) {
        const renote = await _note.default.findOne(note.renoteId);
        if (!renote) throw new Error(`Note(${note._id}) の 対象Renote(${note.renoteId})が存在しない。DB壊れている？`);
        return (0, _announce.default)(renote.uri ? renote.uri : `${_config.default.url}/notes/${renote._id}`, note);
    }
    return (0, _create.default)(await (0, _note1.default)(note, false), note);
}

//# sourceMappingURL=outbox.js.map

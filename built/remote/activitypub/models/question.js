"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    extractPollFromQuestion: function() {
        return extractPollFromQuestion;
    },
    updateQuestion: function() {
        return updateQuestion;
    }
});
const _config = require("../../../config");
const _note = require("../../../models/note");
const _resolver = require("../resolver");
const _type = require("../type");
const _logger = require("../logger");
async function extractPollFromQuestion(source, resolver) {
    if (resolver == null) resolver = new _resolver.default();
    const question = await resolver.resolve(source);
    if (!(0, _type.isQuestion)(question)) {
        throw new Error('invalid type');
    }
    const multiple = !question.oneOf;
    const expiresAt = question.endTime ? new Date(question.endTime) : question.closed ? new Date(question.closed) : null;
    if (multiple && !question.anyOf) {
        throw 'invalid question';
    }
    const choices = (question[multiple ? 'anyOf' : 'oneOf'] || []).map((x, i)=>({
            id: i,
            text: x.name,
            votes: x.replies && x.replies.totalItems || x._misskey_votes || 0
        }));
    if (choices.length > 100) throw 'too many choices';
    return {
        choices,
        multiple,
        expiresAt
    };
}
async function updateQuestion(value, resolver) {
    const uri = typeof value == 'string' ? value : value.id;
    // URIがこのサーバーを指しているならスキップ
    if (uri.startsWith(_config.default.url + '/')) throw 'uri points local';
    //#region このサーバーに既に登録されているか
    const note = await _note.default.findOne({
        uri
    });
    if (note == null) throw 'Question is not registed';
    //#endregion
    // resolve new Question object
    if (resolver == null) resolver = new _resolver.default();
    const question = await resolver.resolve(value);
    _logger.apLogger.debug(`fetched question: ${JSON.stringify(question, null, 2)}`);
    if (question.type !== 'Question') throw 'object is not a Question';
    const apChoices = question.oneOf || question.anyOf;
    const dbChoices = note.poll.choices;
    let changed = false;
    for (const db of dbChoices){
        const oldCount = db.votes;
        const newCount = apChoices.filter((ap)=>ap.name === db.text)[0].replies.totalItems;
        if (oldCount != newCount) {
            changed = true;
            db.votes = newCount;
        }
    }
    await _note.default.update({
        _id: note._id
    }, {
        $set: {
            'poll.choices': dbChoices,
            updatedAt: new Date()
        }
    });
    return changed;
}

//# sourceMappingURL=question.js.map

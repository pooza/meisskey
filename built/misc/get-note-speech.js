"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getSpeechName: function() {
        return getSpeechName;
    },
    getSpeechText: function() {
        return getSpeechText;
    }
});
const _emojiregex = require("./emoji-regex");
const getSpeechName = (note)=>{
    if (note.user.name) {
        let name = note.user.name;
        name = name.replace(new RegExp(_emojiregex.emojiRegex.source, 'g'), '@');
        name = name.replace(/:\w+:/g, '@');
        name = name.replace(/＠/g, '@');
        name = name.replace(/^@+/, '');
        name = name.replace(/@.*/, '');
        return `${name} さん`;
    }
    if (note.user.username) return `${note.user.username} さん`;
    return '';
};
const getSpeechText = (note)=>{
    if (note.deletedAt) {
        return null;
    }
    if (note.isHidden) {
        return null;
    }
    let text = note.cw != null ? note.cw : note.text ? note.text : null;
    text = text.replace(/https?:\/\/.*/g, 'URL');
    // eslint-disable-next-line no-useless-escape
    text = text.replace(/#([^\s\.,!\?'"#:\/\[\]]+)/g, ()=>`hashtag ${RegExp.$1}`);
    let summary = text;
    // ファイルが添付されているとき
    if ((note.files || []).length != 0) {
        summary += ` ${note.files.length}つのファイル`;
    }
    // 投票が添付されているとき
    if (note.poll) {
        summary += ' 投票';
    }
    return summary.trim();
};

//# sourceMappingURL=get-note-speech.js.map

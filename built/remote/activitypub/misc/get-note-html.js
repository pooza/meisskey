"use strict";
Object.defineProperty(exports, "getNoteHtml", {
    enumerable: true,
    get: function() {
        return getNoteHtml;
    }
});
const _tohtml = require("../../../mfm/to-html");
const _parse = require("../../../mfm/parse");
function getNoteHtml(note) {
    let html = (0, _tohtml.toHtml)((0, _parse.parseFull)(note.text), note.mentionedRemoteUsers);
    if (html == null) html = '<p>.</p>';
    return html;
}

//# sourceMappingURL=get-note-html.js.map

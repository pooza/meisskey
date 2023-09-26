"use strict";
Object.defineProperty(exports, "htmlToMfm", {
    enumerable: true,
    get: function() {
        return htmlToMfm;
    }
});
const _tag = require("../models/tag");
const _fromhtml = require("../../../mfm/from-html");
function htmlToMfm(html, tag) {
    const hashtagNames = (0, _tag.extractApHashtagObjects)(tag).map((x)=>x.name).filter((x)=>x != null);
    return (0, _fromhtml.fromHtml)(html, hashtagNames);
}

//# sourceMappingURL=html-to-mfm.js.map

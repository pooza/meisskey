"use strict";
Object.defineProperty(exports, "nyaize", {
    enumerable: true,
    get: function() {
        return nyaize;
    }
});
function nyaize(text) {
    return text// ja-JP
    .replace(/な/g, 'にゃ').replace(/ナ/g, 'ニャ').replace(/ﾅ/g, 'ﾆｬ');
}

//# sourceMappingURL=nyaize.js.map

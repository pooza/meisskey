// Usage: ... <name@host>
"use strict";
const _emoji = require("../models/emoji");
const _emoji1 = require("../remote/activitypub/models/emoji");
const _converthost = require("../misc/convert-host");
async function main(xs) {
    for (const x of xs){
        await resync(x).catch();
    }
}
async function resync(x) {
    x = x.replace(/:/g, '');
    x = x.replace(/\u200b/g, '');
    const m = x.match(/^([^@]+)@(.*)/);
    if (m) {
        const name = m[1];
        const host = (0, _converthost.toDbHost)(m[2]);
        console.log(`resync ${name} ${host}`);
        const emoji = await _emoji.default.findOne({
            name,
            host
        });
        if (emoji == null) throw 'emoji not found';
        await (0, _emoji1.resyncEmoji)(emoji, true);
    }
}
// get args
const args = process.argv.slice(2);
main(args).then(()=>{
    setTimeout(()=>{
        console.log('\n======\n Done\n======');
    }, 2 * 1000);
}).catch((e)=>{
    console.warn(e);
});

//# sourceMappingURL=resync-remote-emoji.js.map

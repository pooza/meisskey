"use strict";
const _emoji = require("../models/emoji");
const _converthost = require("../misc/convert-host");
async function main() {
    const emojis = await _emoji.default.find({}, {
        sort: {
            md5: 1,
            name: 1
        }
    });
    for (const emoji of emojis){
        const name = `${emoji.name}@${(0, _converthost.toApHost)(emoji.host)}`;
        console.log(`${emoji.md5},${name},${emoji.updatedAt ? emoji.updatedAt.toISOString() : ''}`);
    }
}
//const args = process.argv.slice(2);
main().then(()=>{
    process.exit(0);
}).catch((e)=>{
    console.warn(e);
    process.exit(1);
});

//# sourceMappingURL=list-emojis.js.map

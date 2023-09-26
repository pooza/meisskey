"use strict";
const _recountstats = require("../misc/recount-stats");
async function main() {
    await (0, _recountstats.RecountStats)();
}
main().then(()=>{
    console.log('Done');
});

//# sourceMappingURL=recount-stats.js.map

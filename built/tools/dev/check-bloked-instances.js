"use strict";
const _instancemoderation = require("../../services/instance-moderation");
async function main(host) {
    console.log(await (0, _instancemoderation.isBlockedHost)(host));
}
const args = process.argv.slice(2);
main(args[0]).then(()=>{
    console.log('Done');
    setTimeout(()=>{
        process.exit(0);
    }, 5 * 1000);
});

//# sourceMappingURL=check-bloked-instances.js.map

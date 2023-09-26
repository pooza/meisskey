"use strict";
const _parse = require("../misc/acct/parse");
const _resolveuser = require("../remote/resolve-user");
async function main(acct) {
    const { username, host } = (0, _parse.default)(acct);
    await (0, _resolveuser.default)(username, host, {}, true);
}
// get args
const args = process.argv.slice(2);
let acct = args[0];
// normalize args
acct = acct.replace(/^@/, '');
// check args
if (!acct.match(/^\w+@\w/)) {
    throw `Invalid acct format. Valid format are user@host`;
}
console.log(`resync ${acct}`);
main(acct).then(()=>{
    console.log('Done');
}).catch((e)=>{
    console.warn(e);
});

//# sourceMappingURL=resync-remote-user.js.map

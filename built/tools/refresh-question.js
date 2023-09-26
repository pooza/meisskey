"use strict";
const _question = require("../remote/activitypub/models/question");
async function main(uri) {
    return await (0, _question.updateQuestion)(uri);
}
const args = process.argv.slice(2);
const uri = args[0];
main(uri).then((result)=>{
    console.log(`Done: ${result}`);
}).catch((e)=>{
    console.warn(e);
});

//# sourceMappingURL=refresh-question.js.map

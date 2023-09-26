"use strict";
const _fs = require("fs");
const _moment = require("moment");
function parse() {
    // src
    let nasa = [];
    for (const file of [
        `${__dirname}/mooninfo_2022.json`,
        `${__dirname}/mooninfo_2023.json`
    ]){
        const x = JSON.parse((0, _fs.readFileSync)(file, 'utf-8'));
        nasa = nasa.concat(x);
    }
    const result = [];
    for(let i = 0; i < nasa.length; i++){
        const cur = nasa[i];
        // to UNIX
        const time = _moment(cur.time);
        const unix = time.unix();
        const past = nasa[i - 1];
        if (!past) continue;
        // Pick after new-moon records
        if (cur.age < past.age) {
            result.push({
                u: unix,
                p: cur.phase,
                a: cur.age
            });
            console.log(`// Pick ${time.unix()} ${time.toISOString()}`);
        }
    }
    console.log(JSON.stringify(result, null, 2));
}
parse();

//# sourceMappingURL=nasa-moon.js.map

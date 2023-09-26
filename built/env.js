"use strict";
Object.defineProperty(exports, "envOption", {
    enumerable: true,
    get: function() {
        return envOption;
    }
});
const envOption = {
    onlyQueue: false,
    onlyServer: false,
    noDaemons: false,
    disableClustering: false,
    verbose: false,
    withLogTime: false,
    quiet: false,
    slow: false
};
for (const key of Object.keys(envOption)){
    if (process.env['MK_' + key.replace(/[A-Z]/g, (letter)=>`_${letter}`).toUpperCase()]) envOption[key] = true;
}
if (process.env.NODE_ENV === 'test') envOption.disableClustering = true;
if (process.env.NODE_ENV === 'test') envOption.quiet = true;
if (process.env.NODE_ENV === 'test') envOption.noDaemons = true;

//# sourceMappingURL=env.js.map

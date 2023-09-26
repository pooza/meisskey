"use strict";
Object.defineProperty(exports, "objectToXml", {
    enumerable: true,
    get: function() {
        return objectToXml;
    }
});
const xmlbuilder = require("xmlbuilder");
function objectToXml(obj) {
    const xml = xmlbuilder.create(obj, {
        encoding: 'utf-8'
    });
    return xml.end({
        pretty: true
    });
}

//# sourceMappingURL=util.js.map

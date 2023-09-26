"use strict";
Object.defineProperty(exports, "extractMfmTypes", {
    enumerable: true,
    get: function() {
        return extractMfmTypes;
    }
});
function extractMfmTypes(nodes) {
    const types = new Set();
    function scan(nodes) {
        for (const node of nodes){
            types.add(node.type);
            scan(node.children);
        }
    }
    scan(nodes);
    return [
        ...types
    ];
}

//# sourceMappingURL=extract-mfm-types.js.map

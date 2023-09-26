/**
 * Render OrderedCollection
 * @param id URL of self
 * @param totalItems Total number of items
 * @param first URL of first page (optional)
 * @param last URL of last page (optional)
 * @param orderedItems attached objects (optional)
 */ "use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
function _default(id, totalItems, first, last, orderedItems) {
    const page = {
        id,
        type: 'OrderedCollection',
        totalItems
    };
    if (first) page.first = first;
    if (last) page.last = last;
    if (orderedItems) page.orderedItems = orderedItems;
    return page;
}

//# sourceMappingURL=ordered-collection.js.map

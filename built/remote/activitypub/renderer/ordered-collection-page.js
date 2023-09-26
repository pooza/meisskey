/**
 * Render OrderedCollectionPage
 * @param id URL of self
 * @param totalItems Number of total items
 * @param orderedItems Items
 * @param partOf URL of base
 * @param prev URL of prev page (optional)
 * @param next URL of next page (optional)
 */ "use strict";
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
function _default(id, totalItems, orderedItems, partOf, prev, next) {
    const page = {
        id,
        partOf,
        type: 'OrderedCollectionPage',
        totalItems,
        orderedItems
    };
    if (prev) page.prev = prev;
    if (next) page.next = next;
    return page;
}

//# sourceMappingURL=ordered-collection-page.js.map

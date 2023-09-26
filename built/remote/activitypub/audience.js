"use strict";
Object.defineProperty(exports, "parseAudience", {
    enumerable: true,
    get: function() {
        return parseAudience;
    }
});
const _type = require("./type");
const _person = require("./models/person");
const _array = require("../../prelude/array");
const _promiselimit = require("promise-limit");
async function parseAudience(actor, to, cc, resolver) {
    const toGroups = groupingAudience((0, _type.getApIds)(to), actor);
    const ccGroups = groupingAudience((0, _type.getApIds)(cc), actor);
    const others = (0, _array.unique)((0, _array.concat)([
        toGroups.other,
        ccGroups.other
    ]));
    const limit = _promiselimit(2);
    const mentionedUsers = (await Promise.all(others.map((id)=>limit(()=>(0, _person.resolvePerson)(id, null, resolver).catch(()=>null))))).filter((x)=>x != null);
    if (toGroups.public.length > 0) {
        return {
            visibility: 'public',
            mentionedUsers,
            visibleUsers: []
        };
    }
    if (ccGroups.public.length > 0) {
        return {
            visibility: 'home',
            mentionedUsers,
            visibleUsers: []
        };
    }
    if (toGroups.followers.length > 0) {
        return {
            visibility: 'followers',
            mentionedUsers,
            visibleUsers: []
        };
    }
    return {
        visibility: 'specified',
        mentionedUsers,
        visibleUsers: mentionedUsers
    };
}
function groupingAudience(ids, actor) {
    const groups = {
        public: [],
        followers: [],
        other: []
    };
    for (const id of ids){
        if (isPublic(id)) {
            groups.public.push(id);
        } else if (isFollowers(id, actor)) {
            groups.followers.push(id);
        } else {
            groups.other.push(id);
        }
    }
    groups.other = (0, _array.unique)(groups.other);
    return groups;
}
function isPublic(id) {
    return [
        'https://www.w3.org/ns/activitystreams#Public',
        'as:Public',
        'Public'
    ].includes(id);
}
function isFollowers(id, actor) {
    return [
        `${actor.uri}/followers`
    ].includes(id);
}

//# sourceMappingURL=audience.js.map

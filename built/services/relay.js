"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getRelayActor: function() {
        return getRelayActor;
    },
    addRelay: function() {
        return addRelay;
    },
    removeRelay: function() {
        return removeRelay;
    },
    listRelay: function() {
        return listRelay;
    },
    relayAccepted: function() {
        return relayAccepted;
    },
    relayRejected: function() {
        return relayRejected;
    },
    deliverToRelays: function() {
        return deliverToRelays;
    }
});
const _mongodb = require("mongodb");
const _user = require("../models/user");
const _relay = require("../models/relay");
const _createsystemuser = require("./create-system-user");
const _followrelay = require("../remote/activitypub/renderer/follow-relay");
const _renderer = require("../remote/activitypub/renderer");
const _undo = require("../remote/activitypub/renderer/undo");
const _queue = require("../queue");
const ACTOR_USERNAME = 'relay.actor';
async function getRelayActor() {
    const user = await _user.default.findOne({
        host: null,
        username: ACTOR_USERNAME
    });
    if (user) return user;
    const created = await (0, _createsystemuser.createSystemUser)(ACTOR_USERNAME);
    return created;
}
async function addRelay(inbox) {
    const relay = await _relay.default.insert({
        inbox,
        status: 'requesting'
    });
    const relayActor = await getRelayActor();
    const follow = await (0, _followrelay.renderFollowRelay)(relay, relayActor);
    const activity = (0, _renderer.renderActivity)(follow);
    (0, _queue.deliver)(relayActor, activity, relay.inbox);
    return relay;
}
async function removeRelay(inbox) {
    const relay = await _relay.default.findOne({
        inbox
    });
    if (relay == null) {
        throw 'relay not found';
    }
    const relayActor = await getRelayActor();
    const follow = (0, _followrelay.renderFollowRelay)(relay, relayActor);
    const undo = (0, _undo.default)(follow, relayActor);
    const activity = (0, _renderer.renderActivity)(undo);
    (0, _queue.deliver)(relayActor, activity, relay.inbox);
    await _relay.default.remove({
        _id: relay._id
    });
}
async function listRelay() {
    const relays = await _relay.default.find();
    return relays;
}
async function relayAccepted(id) {
    const result = await _relay.default.update(new _mongodb.ObjectID(id), {
        $set: {
            status: 'accepted'
        }
    });
    return JSON.stringify(result);
}
async function relayRejected(id) {
    const result = await _relay.default.update(new _mongodb.ObjectID(id), {
        $set: {
            status: 'rejected'
        }
    });
    return JSON.stringify(result);
}
async function deliverToRelays(user, activity) {
    if (activity == null) return;
    const relays = await _relay.default.find({
        status: 'accepted'
    });
    if (relays.length === 0) return;
    const copy = JSON.parse(JSON.stringify(activity));
    if (!copy.to) copy.to = [
        'https://www.w3.org/ns/activitystreams#Public'
    ];
    const x = await (0, _renderer.attachLdSignature)(copy, user);
    for (const relay of relays){
        (0, _queue.deliver)(user, x, relay.inbox);
    }
}

//# sourceMappingURL=relay.js.map

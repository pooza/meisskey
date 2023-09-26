"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return DeliverManager;
    },
    deliverToFollowers: function() {
        return deliverToFollowers;
    },
    deliverToUser: function() {
        return deliverToUser;
    }
});
const _user = require("../../models/user");
const _following = require("../../models/following");
const _queue = require("../../queue");
const _instancemoderation = require("../../services/instance-moderation");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
const isFollowers = (recipe)=>recipe.type === 'Followers';
const isDirect = (recipe)=>recipe.type === 'Direct';
let DeliverManager = class DeliverManager {
    /**
	 * Add recipe for followers deliver
	 */ addFollowersRecipe() {
        const deliver = {
            type: 'Followers'
        };
        this.addRecipe(deliver);
    }
    /**
	 * Add recipe for direct deliver
	 * @param to To
	 */ addDirectRecipe(to) {
        const recipe = {
            type: 'Direct',
            to
        };
        this.addRecipe(recipe);
    }
    /**
	 * Add recipe
	 * @param recipe Recipe
	 */ addRecipe(recipe) {
        this.recipes.push(recipe);
    }
    /**
	 * Execute delivers
	 */ async execute(lowSeverity = false) {
        if (!(0, _user.isLocalUser)(this.actor)) return;
        const inboxes = [];
        const addToDeliver = (inbox)=>{
            if (inbox.url == null) return;
            if (!inbox.url.match(/^https?:/)) return;
            if (inboxes.map((x)=>x.url).includes(inbox.url)) return;
            inboxes.push(inbox);
        };
        if (this.recipes.some((r)=>isFollowers(r))) {
            // followers deliver
            const followers = await _following.default.find({
                followeeId: this.actor._id
            });
            for (const following of followers){
                const follower = following._follower;
                if ((0, _user.isRemoteUser)(follower)) {
                    const inbox = follower.sharedInbox ? {
                        origin: 'sharedInbox',
                        url: follower.sharedInbox
                    } : {
                        origin: 'inbox',
                        url: follower.inbox,
                        userId: `${follower._id}`
                    };
                    addToDeliver(inbox);
                }
            }
        }
        for (const recipe of this.recipes.filter((recipe)=>isDirect(recipe))){
            // direct deliver
            const inbox = {
                origin: 'inbox',
                url: recipe.to.inbox,
                userId: `${recipe.to._id}`
            };
            if (recipe.to.sharedInbox && inboxes.some((x)=>x.url === recipe.to.sharedInbox)) {
            // skip
            } else if (recipe.to.inbox) {
                addToDeliver(inbox);
            }
        }
        // deliver
        for (const inbox of inboxes){
            try {
                const { host } = new URL(inbox.url);
                if (await (0, _instancemoderation.isBlockedHost)(host)) continue;
                if (await (0, _instancemoderation.isClosedHost)(host)) continue;
                (0, _queue.deliver)(this.actor, this.activity, inbox.url, lowSeverity, inbox);
            } catch (e) {}
        }
    }
    /**
	 * Constructor
	 * @param actor Actor
	 * @param activity Activity to deliver
	 */ constructor(actor, activity){
        _define_property(this, "actor", void 0);
        _define_property(this, "activity", void 0);
        _define_property(this, "recipes", []);
        this.actor = actor;
        this.activity = activity;
    }
};
async function deliverToFollowers(actor, activity, lowSeverity = false) {
    const manager = new DeliverManager(actor, activity);
    manager.addFollowersRecipe();
    await manager.execute(lowSeverity);
}
async function deliverToUser(actor, activity, to, lowSeverity = false) {
    const manager = new DeliverManager(actor, activity);
    manager.addDirectRecipe(to);
    await manager.execute(lowSeverity);
} //#endregion

//# sourceMappingURL=deliver-manager.js.map

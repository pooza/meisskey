"use strict";
Object.defineProperty(exports, "createSystemUser", {
    enumerable: true,
    get: function() {
        return createSystemUser;
    }
});
const _bcryptjs = require("bcryptjs");
const _uuid = require("uuid");
const _user = require("../models/user");
const _generatenativeusertoken = require("../server/api/common/generate-native-user-token");
const _genkeypair = require("../misc/gen-key-pair");
async function createSystemUser(username) {
    const password = (0, _uuid.v4)();
    // Generate hash of password
    const salt = await _bcryptjs.genSalt(8);
    const hash = await _bcryptjs.hash(password, salt);
    // Generate secret
    const secret = (0, _generatenativeusertoken.default)();
    const keyPair = await (0, _genkeypair.genRsaKeyPair)();
    // Create user
    const user = await _user.default.insert({
        avatarId: null,
        bannerId: null,
        createdAt: new Date(),
        description: null,
        followersCount: 0,
        followingCount: 0,
        name: null,
        notesCount: 0,
        username: username,
        usernameLower: username.toLowerCase(),
        host: null,
        keypair: keyPair.privateKey,
        token: secret,
        password: hash,
        isAdmin: false,
        isBot: true,
        isLocked: true,
        refuseFollow: true,
        autoAcceptFollowed: false,
        carefulMassive: false,
        profile: {
            bio: null,
            birthday: null,
            location: null
        },
        settings: {
            autoWatch: false
        }
    });
    return user;
}

//# sourceMappingURL=create-system-user.js.map

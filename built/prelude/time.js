"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    DateUTC: function() {
        return DateUTC;
    },
    isTimeSame: function() {
        return isTimeSame;
    },
    isTimeBefore: function() {
        return isTimeBefore;
    },
    isTimeAfter: function() {
        return isTimeAfter;
    },
    addTimespan: function() {
        return addTimespan;
    },
    subtractTimespan: function() {
        return subtractTimespan;
    }
});
const dateTimeIntervals = {
    'days': 86400000,
    'hours': 3600000
};
function DateUTC(time) {
    const r = new Date(0);
    r.setUTCFullYear(time[0], time[1], time[2]);
    if (time[3]) r.setUTCHours(time[3], ...time.slice(4));
    return r;
}
function isTimeSame(a, b) {
    return a.getTime() - b.getTime() === 0;
}
function isTimeBefore(a, b) {
    return a.getTime() - b.getTime() < 0;
}
function isTimeAfter(a, b) {
    return a.getTime() - b.getTime() > 0;
}
function addTimespan(x, value, span) {
    return new Date(x.getTime() + value * dateTimeIntervals[span]);
}
function subtractTimespan(x, value, span) {
    return new Date(x.getTime() - value * dateTimeIntervals[span]);
}

//# sourceMappingURL=time.js.map

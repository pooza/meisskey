"use strict";
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    formatDateTimeString: function() {
        return formatDateTimeString;
    },
    formatTimeString: function() {
        return formatTimeString;
    }
});
const defaultLocaleStringFormats = {
    'weekday': 'narrow',
    'era': 'narrow',
    'year': 'numeric',
    'month': 'numeric',
    'day': 'numeric',
    'hour': 'numeric',
    'minute': 'numeric',
    'second': 'numeric',
    'timeZoneName': 'short'
};
function formatLocaleString(date, format) {
    return format.replace(/\{\{(\w+)(:(\w+))?\}\}/g, (match, kind, unused, option)=>{
        if ([
            'weekday',
            'era',
            'year',
            'month',
            'day',
            'hour',
            'minute',
            'second',
            'timeZoneName'
        ].includes(kind)) {
            return date.toLocaleString(window.navigator.language, {
                [kind]: option ? option : defaultLocaleStringFormats[kind]
            });
        } else {
            return match;
        }
    });
}
function formatDateTimeString(date, format) {
    return format.replace(/yyyy/g, date.getFullYear().toString()).replace(/yy/g, date.getFullYear().toString().slice(-2)).replace(/MMMM/g, date.toLocaleString(window.navigator.language, {
        month: 'long'
    })).replace(/MMM/g, date.toLocaleString(window.navigator.language, {
        month: 'short'
    })).replace(/MM/g, `0${date.getMonth() + 1}`.slice(-2)).replace(/M/g, (date.getMonth() + 1).toString()).replace(/dd/g, `0${date.getDate()}`.slice(-2)).replace(/d/g, date.getDate().toString()).replace(/HH/g, `0${date.getHours()}`.slice(-2)).replace(/H/g, date.getHours().toString()).replace(/hh/g, `0${date.getHours() % 12 || 12}`.slice(-2)).replace(/h/g, (date.getHours() % 12 || 12).toString()).replace(/mm/g, `0${date.getMinutes()}`.slice(-2)).replace(/m/g, date.getMinutes().toString()).replace(/ss/g, `0${date.getSeconds()}`.slice(-2)).replace(/s/g, date.getSeconds().toString()).replace(/tt/g, date.getHours() >= 12 ? 'PM' : 'AM');
}
function formatTimeString(date, format) {
    // eslint-disable-next-line no-useless-escape
    return format.replace(/\[(([^\[]|\[\])*)\]|(([yMdHhmst])\4{0,3})/g, (match, localeformat, unused, datetimeformat)=>{
        if (localeformat) return formatLocaleString(date, localeformat);
        if (datetimeformat) return formatDateTimeString(date, datetimeformat);
        return match;
    });
}

//# sourceMappingURL=format-time-string.js.map

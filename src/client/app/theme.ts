import * as tinycolor from 'tinycolor2';

export type Theme = {
	id: string;
	name: string;
	author: string;
	desc?: string;
	base?: 'dark' | 'light';
	vars: { [key: string]: string };
	props: { [key: string]: string };
	revision?: number;
};

export const lightTheme: Theme = require('../themes/light.json5');
export const darkTheme: Theme = require('../themes/dark.json5');
export const lavenderTheme: Theme = require('../themes/lavender.json5');
export const futureTheme: Theme = require('../themes/future.json5');
export const halloweenTheme: Theme = require('../themes/halloween.json5');
export const promoTheme: Theme = require('../themes/promo.json5');
export const hikaemeTheme: Theme = require('../themes/hikaeme.json5');
export const halloweenLady: Theme = require('../themes/halloween-lady.json5');
export const cafeTheme: Theme = require('../themes/cafe.json5');
export const japaneseSushiSetTheme: Theme = require('../themes/japanese-sushi-set.json5');
export const gruvboxDarkTheme: Theme = require('../themes/gruvbox-dark.json5');
export const monokaiTheme: Theme = require('../themes/monokai.json5');
export const colorfulTheme: Theme = require('../themes/colorful.json5');
export const rainyTheme: Theme = require('../themes/rainy.json5');
export const mauveTheme: Theme = require('../themes/mauve.json5');
export const grayTheme: Theme = require('../themes/gray.json5');
export const tweetDeckTheme: Theme = require('../themes/tweet-deck.json5');


export const blackTweet: Theme = require('../themes/black-tweet.json5');
export const blackStar: Theme = require('../themes/black-star.json5');
export const blackSakura: Theme = require('../themes/black-sakura.json5');
export const blackOctopus: Theme = require('../themes/black-octopus.json5');
export const blackFire: Theme = require('../themes/black-fire.json5');
export const blackAvocado: Theme = require('../themes/black-avocado.json5');

export const builtinThemes = [
	lightTheme,
	darkTheme,
	lavenderTheme,
	futureTheme,
	halloweenTheme,
	promoTheme,
	hikaemeTheme,
	halloweenLady,
	cafeTheme,
	japaneseSushiSetTheme,
	gruvboxDarkTheme,
	monokaiTheme,
	colorfulTheme,
	rainyTheme,
	mauveTheme,
	grayTheme,
	tweetDeckTheme,
	blackTweet,
	blackStar,
	blackSakura,
	blackOctopus,
	blackFire,
	blackAvocado,
];

export function applyTheme(theme: Theme, persisted = true) {
	document.documentElement.classList.add('changing-theme');

	setTimeout(() => {
		document.documentElement.classList.remove('changing-theme');
	}, 1000);

	// Deep copy
	const _theme = JSON.parse(JSON.stringify(theme));

	if (_theme.base) {
		const base = [lightTheme, darkTheme].find(x => x.id == _theme.base);
		_theme.vars = Object.assign({}, base.vars, _theme.vars);
		_theme.props = Object.assign({}, base.props, _theme.props);
	}

	const props = compile(_theme);

	for (const [k, v] of Object.entries(props)) {
		document.documentElement.style.setProperty(`--${k}`, v.toString());
	}

	if (persisted) {
		localStorage.setItem('theme', JSON.stringify(props));

		const themeColor = document.querySelector('meta[name="theme-color"]');
		if (themeColor && props.bg) themeColor.setAttribute('content', props.bg);
	}
}

function compile(theme: Theme): { [key: string]: string } {
	function getColor(code: string): tinycolor.Instance {
		// ref
		if (code[0] == '@') {
			return getColor(theme.props[code.substr(1)]);
		}
		if (code[0] == '$') {
			return getColor(theme.vars[code.substr(1)]);
		}

		// func
		if (code[0] == ':') {
			const parts = code.split('<');
			const func = parts.shift().substr(1);
			const arg = parseFloat(parts.shift());
			const color = getColor(parts.join('<'));

			switch (func) {
				case 'darken': return color.darken(arg);
				case 'darkenA': return color.darken(arg).setAlpha(0.6);
				case 'lighten': return color.lighten(arg);
				case 'lightenA': return color.lighten(arg).setAlpha(0.6);
				case 'alpha': return color.setAlpha(arg);
			}
		}

		return tinycolor(code);
	}

	const props = {};

	for (const [k, v] of Object.entries(theme.props)) {
		props[k] = genValue(getColor(v));
	}

	const primary = getColor(props['primary']);

	for (let i = 1; i < 10; i++) {
		const color = primary.clone().setAlpha(i / 10);
		props['primaryAlpha0' + i] = genValue(color);
	}

	for (let i = 5; i < 100; i += 5) {
		const color = primary.clone().lighten(i);
		props['primaryLighten' + i] = genValue(color);
	}

	for (let i = 5; i < 100; i += 5) {
		const color = primary.clone().darken(i);
		props['primaryDarken' + i] = genValue(color);
	}

	return props;
}

function genValue(c: tinycolor.Instance): string {
	return c.toRgbString();
}

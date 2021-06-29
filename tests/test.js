// native
import { strict as assert } from 'assert';

// packages
import { chromium, firefox, webkit } from 'playwright';
import { suite } from 'uvu';

// library
import { createServer } from './server.js';
import * as frames from '@newswire/frames';

const browserName = process.env.BROWSER || 'chromium';

const basic = suite('basic');

basic('should export all public functions', () => {
	assert.deepEqual(Object.keys(frames), [
		'Framer',
		'autoInitFrames',
		'initFrame',
		'initFrameAndPoll',
		'observeIframe',
		'sendFrameHeight',
		'sendHeightOnFramerInit',
		'sendHeightOnLoad',
		'sendHeightOnPoll',
		'sendHeightOnResize',
	]);
});

basic.run();

const features = suite('features');

let server;
/** @type {import('playwright').Browser} */
let browser;
/** @type {import('playwright').Page} */
let page;

features.before(async () => {
	browser = await { chromium, webkit, firefox }[browserName].launch();
	page = await browser.newPage();
	server = createServer();
});

features.after(async () => {
	await page.close();
	await browser.close();
	server.close();
});

features('frames', async () => {
	await page.goto('http://localhost:3000/');
	const title = await page.title();
	assert.equal(title, 'Document');

	const iframe = await page.waitForSelector('iframe');
	const frame = await iframe.contentFrame();
	const box = await iframe.boundingBox();

	// before activating
	assert.equal(box.height, 150);

	await page.addScriptTag({ url: '/embed.js', type: 'module' });

	// after activating
	assert.equal(
		await frame.evaluate(() => document.documentElement.clientHeight),
		(await iframe.boundingBox()).height,
	);
});

features.run();

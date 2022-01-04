// native
import { strict as assert } from 'node:assert';

// packages
import { chromium, firefox, webkit } from 'playwright';
import { suite } from 'uvu';

// library
import { createServer } from './server.js';
import * as frames from '../src/index.js';

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

features.before.each(async () => {
	await page.goto('http://localhost:3000/');
});

features.after(async () => {
	await page.close();
	await browser.close();
	server.close();
});

features('sendFrameHeight()', async () => {
	// get iframe on page
	const iframe = page.locator('iframe');
	// assert initial height is 150
	assert.equal((await iframe.boundingBox()).height, 150);
	// inject the frame observer code
	await page.addScriptTag({ url: '/observe-iframe.js', type: 'module' });
	// set the src on the iframe and wait for it to load
	await iframe.evaluate((iframe) => {
		iframe.src = '/send-frame-height.html';

		return new Promise((resolve) => {
			iframe.onload = resolve;
		});
	});
	// assert the iframe now has the new height of 300
	assert.equal((await iframe.boundingBox()).height, 300);
});

features('sendHeightOnLoad()', async () => {
	// get iframe on page
	const iframe = page.locator('iframe');
	// assert initial height is 150
	assert.equal((await iframe.boundingBox()).height, 150);
	// inject the frame observer code
	await page.addScriptTag({ url: '/observe-iframe.js', type: 'module' });
	// set the src on the iframe and wait for it to load
	await iframe.evaluate((iframe) => {
		iframe.src = '/send-height-on-load.html';

		return new Promise((resolve) => {
			iframe.onload = resolve;
		});
	});
	// assert the iframe now has the new height of 300
	assert.equal((await iframe.boundingBox()).height, 300);
});

features('sendHeightOnPoll()', async () => {
	// get iframe on page
	const iframe = page.locator('iframe');
	// assert initial height is 150
	assert.equal((await iframe.boundingBox()).height, 150);
	// inject the frame observer code
	await page.addScriptTag({ url: '/observe-iframe.js', type: 'module' });
	// set the src on the iframe and wait for it to load, then wait for that
	// first poll to land
	await Promise.all([
		iframe.evaluate((iframe) => {
			iframe.src = '/send-height-on-poll.html';

			return new Promise((resolve) => {
				iframe.onload = resolve;
			});
		}),
		page.waitForFunction(() => {
			return new Promise((resolve) => {
				window.addEventListener('message', resolve);
			});
		}),
	]);

	// assert the iframe now has the new height of 300
	assert.equal((await iframe.boundingBox()).height, 300);
});

features('sendHeightOnResize()', async () => {
	// get iframe on page
	const iframe = page.locator('iframe');
	// assert initial height is 150
	assert.equal((await iframe.boundingBox()).height, 150);
	// inject the frame observer code
	await page.addScriptTag({ url: '/observe-iframe.js', type: 'module' });
	// set the src on the iframe and wait for it to load
	await iframe.evaluate((iframe) => {
		iframe.src = '/send-height-on-resize.html';

		return new Promise((resolve) => {
			iframe.onload = resolve;
		});
	});

	// change the width of the iframe to trigger a resize
	await Promise.all([
		iframe.evaluate((iframe) => {
			iframe.style.width = '400px';
		}),
		page.waitForFunction(() => {
			return new Promise((resolve) => {
				window.addEventListener('message', resolve);
			});
		}),
	]);

	// assert the iframe now has the new height of 300
	assert.equal((await iframe.boundingBox()).height, 300);
});

features('sendHeightOnFramerInit()', async () => {
	// get iframe on page
	const iframe = page.locator('iframe');
	// assert initial height is 150
	assert.equal((await iframe.boundingBox()).height, 150);

	// we do this in reverse — the trigger is the *observer* connecting!

	// set the src on the iframe and wait for it to load
	await iframe.evaluate((iframe) => {
		iframe.src = '/send-height-on-framer-init.html';

		return new Promise((resolve) => {
			iframe.onload = resolve;
		});
	});

	// inject the frame observer code
	await Promise.all([
		page.addScriptTag({ url: '/observe-iframe.js', type: 'module' }),
		page.waitForFunction(() => {
			return new Promise((resolve) => {
				window.addEventListener('message', resolve);
			});
		}),
	]);

	// assert the iframe now has the new height of 300
	assert.equal((await iframe.boundingBox()).height, 300);
});

features.run();

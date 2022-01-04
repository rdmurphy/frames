// native
import { strict as assert } from 'node:assert';

// packages
import { chromium, firefox, webkit } from 'playwright';
import { suite } from 'uvu';

// library
import { createServer } from './server.js';
import * as lib from '../src/index.js';
import * as constants from '../src/constants.js';

const browserName = process.env.BROWSER || 'chromium';

const basic = suite('basic');

basic('should export all public functions', () => {
	assert.deepEqual(Object.keys(lib), [
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

let server;
/** @type {import('playwright').Browser} */
let browser;
/** @type {import('playwright').Page} */
let page;

async function before() {
	browser = await { chromium, webkit, firefox }[browserName].launch();
	page = await browser.newPage();
	server = createServer();
}

async function beforeEach() {
	await page.goto('http://localhost:3000/');
}

async function after() {
	await page.close();
	await browser.close();
	server.close();
}

const frames = suite('frames');

frames.before(before);
frames.before.each(beforeEach);
frames.after(after);

frames('frames.sendFrameHeight()', async () => {
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

frames('frames.sendHeightOnLoad()', async () => {
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

frames('frames.sendHeightOnPoll()', async () => {
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

frames('frames.sendHeightOnResize()', async () => {
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

frames('frames.sendHeightOnFramerInit()', async () => {
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

frames.run();

const framer = suite('framer');

framer.before(before);
framer.before.each(beforeEach);
framer.after(after);

framer('framer.observeIframe()', async () => {
	// get iframe on page
	const iframe = page.locator('iframe');
	// assert initial height is 150
	assert.equal((await iframe.boundingBox()).height, 150);
	// inject the frame observer code
	await page.addScriptTag({ url: '/observe-iframe.js', type: 'module' });
	// set the src on the iframe and wait for it to load
	await iframe.evaluate((iframe) => {
		iframe.src = '/send-frame-height-controller.html';

		return new Promise((resolve) => {
			iframe.onload = resolve;
		});
	});

	// hook into the iframe's frame
	const iframeHandle = await iframe.elementHandle();
	const contentFrame = await iframeHandle.contentFrame();

	// update the frame's height and wait for the observer to pick it up
	await Promise.all(
		[
			contentFrame.evaluate(() => {
				window.sendFrameHeight(350);
			}),
		],
		// while we're here - let's make sure the event comes over cleanly
		page.waitForFunction((constants) => {
			return new Promise((resolve) => {
				window.addEventListener('message', (event) => {
					const { data } = event;

					resolve(
						data.sentinel === constants.AMP_SENTINEL &&
							data.type === constants.EMBED_SIZE,
					);
				});
			});
		}, constants),
	);

	// assert the iframe now has the new height of 350
	assert.equal((await iframe.boundingBox()).height, 350);

	// update the frame's height again
	await contentFrame.evaluate(() => {
		window.sendFrameHeight(450);
	});

	// now disconnect our observer
	await page.evaluate(() => {
		window.unobserve();
	});

	// update the frame's height one more time
	await contentFrame.evaluate(() => {
		window.sendFrameHeight(550);
	});

	// the iframe should still have the height of 450
	assert.equal((await iframe.boundingBox()).height, 450);
});

framer('Framer()', async () => {
	// prep for the eventual iframe on the page
	const iframe = page.locator('#iframe-container > iframe');

	// inject the frame observer code and wait for the height message
	await page.addScriptTag({ url: '/init-framer.js', type: 'module' });

	// assert initial height is 150
	assert.equal((await iframe.boundingBox()).height, 150);

	// hook into the iframe's frame
	const iframeHandle = await iframe.elementHandle();
	const contentFrame = await iframeHandle.contentFrame();

	// assert Framer set the width
	assert.equal(await iframe.getAttribute('width'), '100%');
	// assert Framer set scrolling
	assert.equal(await iframe.getAttribute('scrolling'), 'no');
	// assert Framer set scrolling
	assert.equal(await iframe.getAttribute('scrolling'), 'no');
	// assert Framer set marginheight
	assert.equal(await iframe.getAttribute('marginheight'), '0');
	// assert Framer set frameborder
	assert.equal(await iframe.getAttribute('frameborder'), '0');
	// assert Framer set sandbox via attributes option
	assert.equal(
		await iframe.getAttribute('sandbox'),
		'allow-scripts allow-same-origin',
	);

	await contentFrame.evaluate(() => {
		window.sendFrameHeight(350);
	});

	// assert the height is 350
	assert.equal((await iframe.boundingBox()).height, 350);

	// update the frame's height again
	await contentFrame.evaluate(() => {
		window.sendFrameHeight(450);
	});

	// set up the next assertion
	assert.equal(await iframe.count(), 1);

	// now remove our framer instance
	await page.evaluate(() => {
		window.framer.remove();
	});

	// the iframe should be gone
	assert.equal(await iframe.count(), 0);
});

framer.run();

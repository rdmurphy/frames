// native
import { createServer } from 'node:http';

// packages
import sirv from 'sirv';

const dist = sirv('./dist', { dev: true });
const examples = sirv('./examples', { dev: true });
const wares = [dist, examples];

createServer(function requestListener(req, res) {
	let index = 0;

	function next() {
		const ware = wares[index++];

		if (!ware) {
			res.statusCode = 404;
			res.end('404 Not Found');
			return;
		}

		ware(req, res, next);
	}

	next();
}).listen(3000);

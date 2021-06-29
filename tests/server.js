// native
import http from 'http';
import { fileURLToPath } from 'url';

// packages
import sirv from 'sirv';

export function createServer() {
	const dist = sirv(fileURLToPath(new URL('../dist', import.meta.url)), {
		dev: true,
	});
	const examples = sirv(fileURLToPath(new URL('./public', import.meta.url)), {
		dev: true,
	});
	const wares = [dist, examples];

	const server = http
		.createServer(function requestListener(req, res) {
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
		})
		.listen(3000);

	return {
		close() {
			server.close();
		},
	};
}

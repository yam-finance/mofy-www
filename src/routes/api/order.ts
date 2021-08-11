// src/routes/api/order.ts
import type { Request, Response } from '@sveltejs/kit';

// @todo The following endpoints can be combined in the future

export async function post(req: Request): Promise<Response> {
	try {
		console.log(req.body);

		// @todo Replace in prod
		const res = await fetch(`https://api.yam.finance/mofy/orders/${req.headers['id']}`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: req.body && JSON.stringify(req.body)
		});

		const data = await res.json();

		return {
			status: 200,
			body: {
				orderDetails: data
			}
		};
	} catch (err) {
		console.log(err);
		return {
			// @todo Specify error code to give the client more information
			status: 500,
			body: {
				error: {
					message: 'Internal Server Error'
				}
			}
		};
	}
}

export async function get(req: Request): Promise<Response> {
	try {
		// @todo Replace in prod
		const res = await fetch(`https://api.yam.finance/mofy/orders/${req.headers['id']}`, {
			method: 'GET',
			headers: {
				'content-type': 'application/json'
			}
		});

		const data = await res.json();

		return {
			status: 200,
			body: {
				orderDetails: data
			}
		};
	} catch (err) {
		console.log(err);
		return {
			// @todo Specify error code to give the client more information
			status: 500,
			body: {
				error: {
					message: 'Internal Server Error'
				}
			}
		};
	}
}

export async function del(req: Request): Promise<Response> {
	try {
		// @todo Replace in prod
		const res = await fetch(`https://api.yam.finance/mofy/orders/${req.headers['id']}`, {
			method: 'DELETE',
			headers: {
				'content-type': 'application/json'
			}
		});

		const data = await res.json();

		return {
			status: 200,
			body: {
				orderDetails: data
			}
		};
	} catch (err) {
		console.log(err);
		return {
			// @todo Specify error code to give the client more information
			status: 500,
			body: {
				error: {
					message: 'Internal Server Error'
				}
			}
		};
	}
}

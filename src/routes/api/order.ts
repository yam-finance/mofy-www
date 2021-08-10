// src/routes/api/order.ts
import type { Request, Response } from '@sveltejs/kit';

export async function post(req: Request): Promise<Response> {
	try {
		console.log(req.body);

		return {
			status: 200,
			body: {
				orderDetails: {}
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

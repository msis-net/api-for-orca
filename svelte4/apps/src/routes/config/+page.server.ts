import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import prisma from '$lib/server/prisma';

export const load = (async ({ params }) => {
	const weborcaData = await prisma.weborca.findMany({
		where: { enable: true },
		select: {
			url: true,
			certificate: true,
			certPassword: true,
			certExpiry: true,
			loginId: true,
			loginPassword: true
			// certBinaryは除外
		}
	});

	return {
		config: {
			weborca: weborcaData
		}
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	weborca: async ({ request }) => {
		const data = await request.formData();
		try {
			const formEntries = Array.from(data.entries());
			for (const [name, value] of formEntries) {
				const existingFacility = await prisma.weborca.findFirst({
					where: { enable: true }
				});

				if (existingFacility) {
					await prisma.weborca.update({
						where: { pkey: existingFacility.pkey },
						data: {
							[name]: value.toString()
						}
					});
				} else {
					await prisma.weborca.create({
						data: {
							[name]: value.toString(),
							enable: true
						}
					});
				}
			}
			return { success: true };
		} catch (error) {
			return { success: false, error: 'Failed to update weborca' };
		}
	},
	byteUpload_weborca: async ({ request }) => {
		const formData = await request.formData();
		const action = formData.get('action');
		const existingFacility = await prisma.weborca.findFirst({
			where: { enable: true }
		});
		if (action === 'delete') {
			if (existingFacility) {
				await prisma.weborca.update({
					where: { pkey: existingFacility.pkey },
					data: {
						['certificate']: null,
						['certBinary']: null
					}
				});
			}
		} else {
			const file = formData.get('file');
			if (file instanceof File) {
				const fileBuffer = Buffer.from(await file.arrayBuffer());
				const filename = file.name;

				if (existingFacility) {
					await prisma.weborca.update({
						where: { pkey: existingFacility.pkey },
						data: {
							['certificate']: filename,
							['certBinary']: fileBuffer
						}
					});
				} else {
					await prisma.weborca.create({
						data: {
							['certificate']: filename,
							['certBinary']: fileBuffer,
							enable: true
						}
					});
				}
			}
		}
	}
};

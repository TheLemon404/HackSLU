import type { PageServerLoad } from './$types.js';
import { getAllQuestions } from '$lib/psychiatrics/questions.js';

export const load: PageServerLoad = async ({ params }) => {
	return {
		questions: await getAllQuestions()
	};
};
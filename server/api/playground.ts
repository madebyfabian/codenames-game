import { readFile, writeFile } from 'fs/promises'

export default defineEventHandler(async event => {
	/**
	 * - Read a json file
	 * - Go Through array of objects
	 * - For each object, transform it
	 * - Write the transformed object to a new json file
	 */
	const fileDataRaw = await readFile('data.json', 'utf-8')
	const fileData = JSON.parse(fileDataRaw)

	const transformedData = fileData.map((item: any) => {
		return {
			word: (item.wordGerman as string).split(' ').pop(),
		}
	})

	await writeFile(
		'data-transformed.json',
		JSON.stringify(transformedData, null, 2)
	)

	return {
		success: true,
	}
})

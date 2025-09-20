import Papa from "papaparse";

/**
 * Parses a CSV file and returns a Promise that resolves with the parsed data.
 * @param {File} file - The CSV file to parse
 * @param {Object} options - PapaParse options (optional)
 * @returns {Promise<Array<Object>>} - Resolves with array of row objects
 */
export function parseCSV(file, options = {}) {
	return new Promise((resolve, reject) => {
		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			...options,
			complete: (results) => {
				if (results.errors && results.errors.length > 0) {
					reject(results.errors);
				} else {
					resolve(results.data);
				}
			},
			error: (error) => {
				reject(error);
			},
		});
	});
}

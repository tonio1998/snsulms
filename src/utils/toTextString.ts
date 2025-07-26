export function toTextString(value: any): string {
	if (typeof value === 'string') return value;
	if (value === undefined || value === null) return '';
	if (typeof value === 'object') return JSON.stringify(value);
	return String(value);
}

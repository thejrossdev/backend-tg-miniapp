export const isEmptyObj = (obj: object) => Object.keys(obj).length === 0 && obj.constructor === Object;

export const concatStr = (strings: (number | string)[], divider?: string): string => strings.join(divider ?? ' ');

export const getOrderNumber = () => `ORD-${getTimestampBasedCode().toUpperCase()}`;

export const getUniqueReferralCode = () => {
	return `r${getRandomCode(10)}e${getRandomCode(10)}f${getRandomCode(10)}e`.replaceAll('-', '').toLowerCase();
};

export const getRandomCode = (length: number = 8): string => {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let result = '';

	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}

	return result;
};

export const getTimestampBasedCode = (): string => {
	const timestamp = Date.now().toString(36).toUpperCase();
	const random = Math.random().toString(36).substring(2, 9).toUpperCase();
	return `${timestamp}${random}`;
};

export const getRandomInt = (min: number, max: number) => {
	const minCelled = Math.ceil(min),
		maxFloored = Math.floor(max);
	return Math.floor(Math.random() * (maxFloored - minCelled) + minCelled); // The maximum is exclusive and the minimum is inclusive
};

export const generateRefreshTime = async (day = 3): Promise<string> => {
	const threeDays = day * 24 * 60 * 60 * 1000; // 3 days in milliseconds
	const refreshTime = new Date(Date.now() + threeDays);
	return refreshTime.toISOString();
};

export * from './amazon-s3';
export * from './file';
export * from './file-s3';
export * from './hashString';
export * from './otp';
export * from './validateEnv';

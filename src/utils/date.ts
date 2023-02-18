export const diffToHuman = (diff: number, isFuture = false) => {
	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);

	if (minutes < 1) return isFuture ? 'a few seconds' : 'a few seconds ago';
	if (isFuture) return minutes === 1 ? '1 minute' : `${minutes} minutes`;
	return minutes === 1 ? 'a minute ago' : `${minutes} minutes ago`;
};

export const getDueTime = (due: number, isPast = false) => {
	const dueDate = new Date(due * 1000);
	const date = `${dueDate.getDate()}${dateOrdinal(dueDate.getDate())} ${getMonth(dueDate.getMonth())}`;
	const relative = accurateDiff(due, isPast);

	return isPast ? `${date} (${relative} ago)` : `${date} (in ${relative})`;
};

const dateOrdinal = (date: number) => {
	if (date > 3 && date < 21) return 'th';

	switch (date % 10) {
		case 1:
			return 'st';
		case 2:
			return 'nd';
		case 3:
			return 'rd';
		default:
			return 'th';
	}
};

const getMonth = (month: number) => {
	const months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
	return months[month];
};

const accurateDiff = (due: number, isPast = false) => {
	const diff = isPast ? Date.now() - due * 1000 : due * 1000 - Date.now();
	const days = Math.floor(diff / 1000 / 60 / 60 / 24);
	const hours = Math.floor(diff / 1000 / 60 / 60) % 24;
	const minutes = Math.floor(diff / 1000 / 60) % 60;

	let res = '';

	if (minutes > 0) res = `${minutes}m ${res}`;
	if (hours > 0) res = `${hours}h ${res}`;
	if (days > 0) res = `${days}d ${res}`;

	return res.trim();
};

export const getNextRefresh = () => {
	const ms = 1000 * 60 * 15;
	const nextRefresh = new Date(Math.ceil(new Date().getTime() / ms) * ms).getTime();

	return diffToHuman(nextRefresh - Date.now(), true);
};

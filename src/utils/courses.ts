const courses = (() => {
	const coursesMapping: Record<number, string> = {};

	const courses = process.env.NEXT_PUBLIC_COURSES!.split(' ');

	for (const c of courses) {
		const [id, name] = c.split('-');
		coursesMapping[parseInt(id)] = name;
	}

	return coursesMapping;
})();

export default courses;

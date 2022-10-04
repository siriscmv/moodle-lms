const getCourses = () => {
	const coursesMapping: Record<number, string> = {};

	const courses = process.env.NEXT_PUBLIC_COURSES!.split(' ');

	for (const c of courses) {
		const [id, name] = c.split('-');
		coursesMapping[parseInt(id)] = name;
	}

	return coursesMapping;
};

const courses = getCourses();
export default courses;

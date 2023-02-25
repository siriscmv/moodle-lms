import Link from 'next/link';

const LoginPage = () => {
	return (
		<div className='flex flex-col text-center my-auto mt-12 text-white'>
			<h1 className='text-3xl font-bold text-primary'>Authentication</h1>
			<span className='font-semibold text-lg p-2 m-2'>
				You must authenticate yourself with the institution email account to access certain content
			</span>
			<Link href='/api/login' passHref>
				<button className='bg-primaryBg border-2 p-4 m-4 rounded-md text-primary text-xl font-bold border-slate hover:border-primary'>
					Proceed
				</button>
			</Link>
		</div>
	);
};

export default LoginPage;

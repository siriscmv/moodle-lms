import courses from '@utils/courses';
import type { NextPage } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'tabler-icons-react';

const Page: NextPage = () => {
	return (
		<div className='flex flex-col justify-center items-center p-4 m-4'>
			<h1 className='font-black text-5xl text-center text-primary'>
				<b>Files</b>
			</h1>
			<div className='text-sm text-white/50 text-center mt-4'>This content is refreshed once every 24 hours</div>
			<div className='flex flex-row justify-between mt-2'>
				<Link
					className='flex flex-row justify-center items-center bg-primaryBg hover:border-primary transition-all ease-in-out duration-150 border-2 text-center border-primaryBg rounded-md text-primary font-bold p-4 m-4'
					href='/'
				>
					<ArrowLeft />
					<span className='ml-2'>Go Back</span>
				</Link>
			</div>
			<span className='text-white/90 font-bold text-2xl text-center my-8'>Choose a course</span>
			<div className='flex flex-wrap text-white font-bold uppercase text-lg justify-center items-center p-4'>
				{Object.entries(courses).map((c) => {
					return (
						<Link
							href={`/files/${c[0]}`}
							key={c[0]}
							className='flex flex-row w-[96px] text-primary border-2 border-slate hover:border-primary transition-all ease-in-out duration-150 bg-primaryBg justify-center items-center p-4 m-4 rounded-md'
						>
							{c[1]}
						</Link>
					);
				})}
			</div>
			<div className='bottom-4 text-center text-white/90'>{`Made by ${process.env.NEXT_PUBLIC_AUTHOR!}`}</div>
		</div>
	);
};

export default Page;

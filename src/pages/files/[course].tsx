import courses from '@utils/courses';
import { dateOrdinal, getMonth } from '@utils/date';
import { File } from '@utils/syncFiles';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink } from 'tabler-icons-react';

const Skeleton = () => {
	return (
		<div className='flex flex-wrap justify-center items-center'>
			{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
				<div key={i} className='self-strech max-w-md w-full sm:w-md my-2 pr-4'>
					<div className='flex flex-row h-full justify-between  border-2 border-primary bg-slate items-center p-4 rounded-md'>
						<div className='flex flex-col'>
							<div className='animate-pulse m-1 w-56 h-8 bg-white/60 rounded-lg' />
							<div className='animate-pulse m-1 w-36 h-4 bg-white/60 rounded-lg' />
							<div className='animate-pulse m-1 w-36 h-4 bg-white/60 rounded-lg' />
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

const Page: NextPage = () => {
	const router = useRouter();
	const { course } = router.query;

	const [files, setFiles] = useState<File[] | null>(null);
	const [newFiles, setNewFiles] = useState<number[]>([]);

	useEffect(() => {
		if (!course) return;
		fetch(`/api/files?course=${course}`)
			.then((res) => {
				if (res.url.includes('auth')) return (window.location.href = '/auth');
				if (res.ok) return res.json();
				return Promise.resolve({ files: [] });
			})
			.then((d) => {
				const files = d.files;
				setFiles(files);

				const seenFiles =
					window.localStorage
						.getItem(`seen-files-${course}`)
						?.split(',')
						?.map((n) => parseInt(n)) ?? [];
				setNewFiles(files.filter((f: any) => !seenFiles.includes(f.id)).map((f: any) => f.id));
				window.localStorage.setItem(`seen-files-${course}`, files.map((f: any) => f.id).join(','));
			});
	}, [course]);

	if (!course) return null;
	return (
		<div className='flex flex-col justify-center items-center p-4 m-4'>
			<h1 className='font-black text-5xl text-center text-primary'>
				<b>{courses[parseInt(course as string)]}</b>
			</h1>
			<div className='text-sm text-white/50 text-center mt-4'>This content is refreshed once every 24 hours</div>
			<Link
				className='flex flex-row hover:underline justify-center items-center transition-all ease-in-out duration-150 text-base text-primary text-center mt-4'
				target='_blank'
				href={`https://${process.env.NEXT_PUBLIC_HOST}/course/view.php?id=${course}`}
			>
				<span className='mr-2'>Visit course page</span>
				<ExternalLink />
			</Link>
			<div className='flex flex-row justify-between mt-2'>
				<Link
					className='flex flex-row justify-center items-center bg-primaryBg hover:border-primary transition-all ease-in-out duration-150 border-2 text-center border-primaryBg rounded-md text-primary font-bold p-4 m-4'
					href='/files'
				>
					<ArrowLeft />
					<span className='ml-2'>Go Back</span>
				</Link>
			</div>
			<div className='flex flex-col text-white text-lg self-center p-4 items-center'>
				{files ? (
					groupFiles(files).map((topic) => {
						return (
							<div key={topic.name} className='m-2 p-4 w-full'>
								<div className='items-center mx-auto justify-center'>
									<span className='text-2xl font-bold text-primary self-center lg:text-left'>{topic.name}</span>
									<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4'>
										{topic.files.map((f) => {
											const date = new Date(f.modified * 1000);
											return (
												<div key={f.id} className='relative self-strech max-w-md w-full py-2'>
													<div className='flex flex-row p-4 items-stretch overflow-x-auto h-full justify-between border-2 border-primary bg-slate rounded-md'>
														<div className='flex flex-col h-full justify-between'>
															<div className='flex flex-col flex-grow justify-start'>
																<span className='font-bold justify-center'>{f.name}</span>
															</div>
															<div className='flex flex-col'>
																{f.pages ? (
																	<span className='font-medium text-sm'>
																		Pages <span className='text-primary'>{f.pages}</span>
																	</span>
																) : null}
																<span className='font-medium text-sm'>
																	File Type <span className='uppercase text-primary'>{f.ext}</span>
																</span>
																<span className='text-white/90 text-sm font-medium'>
																	Modified on{' '}
																	<span className='text-primary'>
																		{date.getDate()}
																		{dateOrdinal(date.getDate())} {getMonth(date.getMonth())}
																	</span>
																</span>
															</div>
														</div>
														<Link
															target='_blank'
															href={`/api/files/download/${f.id}`}
															className='p-3 m-2 font-bold bg-primaryBg hover:border-primary transition-all ease-in-out duration-150 border-2 border-primaryBg rounded-md text-primary flex flex-col justify-center'
														>
															<span className='inline-block align-middle'>
																<ExternalLink />
															</span>
														</Link>
													</div>
													{newFiles.includes(f.id) ? (
														<span className='flex absolute h-3 w-3 top-0 right-0 mt-1 -mr-1'>
															<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/90 opacity-75' />
															<span className='relative inline-flex rounded-full h-3 w-3 bg-primary' />
														</span>
													) : null}
												</div>
											);
										})}
									</div>
								</div>
							</div>
						);
					})
				) : (
					<Skeleton />
				)}
			</div>
			<div className='bottom-4 text-center text-white/90'>{`Made by ${process.env.NEXT_PUBLIC_AUTHOR!}`}</div>
		</div>
	);
};

export default Page;

const groupFiles = (files: File[]) => {
	const groups: { name: string; files: File[] }[] = [];
	const sorted = files.sort((a, b) => a.position - b.position);

	for (const f of sorted) {
		const group = groups.find((g) => g.name === f.topic);
		if (group) group.files.push(f);
		else groups.push({ name: f.topic, files: [f] });
	}

	return groups;
};

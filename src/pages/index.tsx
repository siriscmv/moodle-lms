import courses from '@utils/courses';
import { diffToHuman, getDueTime, getNextRefresh } from '@utils/date';
import type { Assignment } from '@utils/getAssignments';
import subscribe, { getSubscription, revoke } from '@utils/subscribe';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Bell, BellOff, BrandGithub, ExternalLink } from 'tabler-icons-react';

type ApiResponse = { lastRefresh: number; assignments: Assignment[] };

const Skeleton = () => {
	return (
		<>
			{[1, 2, 3, 4, 5].map((i) => (
				<div className='bg-slate border-2 border-primary p-4 m-4 self-stretch rounded-lg shadow-bottom' key={i}>
					<div className='flex flex-row justify-between'>
						<div className='flex flex-col w-48 text-slate'>
							<div className='animate-pulse m-1 w-24 h-4 bg-white/70 text-lg font-semibold rounded-lg' />
							<div className='animate-pulse m-1 w-20 h-4 bg-white/40 font-sm rounded-lg' />
							<div className='animate-pulse m-1 w-32 h-4 bg-white/60 font-bold rounded-lg' />
						</div>
						<div className='p-2 m-2 font-bold flex flex-col justify-center'>
							<span className='text-slate inline-block align-middle'>
								<div className='w-12 h-12 rounded-xl bg-white/50' />
							</span>
						</div>
					</div>
				</div>
			))}
		</>
	);
};

const Home: NextPage = () => {
	const [data, setData] = useState<null | ApiResponse>(null);
	const [notificationsState, setNotificationsState] = useState<null | 'enabled' | 'disabled'>(null);

	useEffect(() => {
		fetch('/api/assignments')
			.then((res) => {
				if (res.ok) return res.json();

				toast.error('Failed to fetch assignments');
				return Promise.resolve({ lastRefresh: 0, assignments: [] });
			})
			.then((data: ApiResponse) => setData(data));
	}, []);

	useEffect(() => {
		getSubscription(false)
			.then((sub) => {
				if (!sub) return setNotificationsState('disabled');

				fetch('/api/notifications', {
					method: 'POST',
					headers: {
						'content-type': 'application/json'
					},
					body: JSON.stringify({ endpoint: sub.endpoint })
				})
					.then((res) => res.json())
					.then((data) => setNotificationsState(data.subscribed ? 'enabled' : 'disabled'));
			})
			.catch(() => setNotificationsState('disabled'));
	}, []);

	return (
		<div className='flex flex-col justify-center items-center p-4 m-4'>
			<Toaster
				position='top-center'
				reverseOrder={true}
				toastOptions={{
					duration: 6_000,
					className: 'text-center',
					success: {
						style: {
							background: '#0A4205',
							color: '#66F359'
						}
					},
					error: {
						style: {
							background: '#42050A',
							color: '#f35966'
						}
					}
				}}
			/>
			<h1 className='font-bold text-5xl text-center text-primary'>
				<b>Assignments</b>
			</h1>
			<div className='text-sm text-white/50 text-center mt-4'>
				{data
					? `Last refreshed ${diffToHuman(Date.now() - data!.lastRefresh!)}. Next refresh is in ${getNextRefresh()}`
					: 'Pulling data...'}
			</div>
			<div className='flex flex-row justify-between mt-2'>
				<Link href='https://github.com/Siris01/moodle-scraper'>
					<a
						target='_blank'
						className='flex flex-row justify-center items-center bg-primaryBg hover:border-primary border-2 text-center border-primaryBg rounded-md text-primary font-semibold p-4 m-4'
					>
						<span className='mr-2'>GitHub</span>
						<BrandGithub />
					</a>
				</Link>
			</div>
			<div className='flex flex-col justify-center items-center p-4'>
				{data ? (
					<div className='text-white'>
						{data.assignments.map((assignment) => (
							<div
								className='bg-slate border-2 border-primary p-4 m-4 self-stretch rounded-lg shadow-bottom'
								key={assignment.id}
							>
								<div className='flex flex-row justify-between'>
									<div className='flex flex-col'>
										<div className='text-lg font-semibold'>{assignment.name}</div>
										<div className='text-white/70 text-sm'>{courses[assignment.course]}</div>
										<div className='text-white/90 text-md'>Due on {getDueTime(assignment.due)}</div>
									</div>
									<Link href={`https://${process.env.NEXT_PUBLIC_HOST}/mod/assign/view.php?id=${assignment.id}`}>
										<a
											aria-label={`Visit the LMS page for ${assignment.name}`}
											target='_blank'
											className='p-2 m-2 font-bold bg-primaryBg hover:border-primary border-2 border-primaryBg rounded-md text-primary flex flex-col justify-center'
										>
											<span className='inline-block align-middle'>
												<ExternalLink />
											</span>
										</a>
									</Link>
								</div>
							</div>
						))}
					</div>
				) : (
					<Skeleton />
				)}
			</div>
			{notificationsState ? (
				<button
					aria-label={notificationsState === 'enabled' ? 'Disable notifications' : 'enable notifications'}
					onClick={() => {
						if (notificationsState === 'enabled') {
							revoke().then(() => setNotificationsState('disabled'));
						} else {
							subscribe().then(() => setNotificationsState('enabled'));
						}
					}}
					className='z-50 fixed font-bold bottom-8 left-8 rounded-full bg-primary hover:bg-primary/60 text-slate p-4'
				>
					{notificationsState === 'enabled' ? <BellOff /> : <Bell />}
				</button>
			) : (
				<></>
			)}
			<div className='bottom-4 text-center text-white/90 font-md'>{`Made by ${process.env.NEXT_PUBLIC_AUTHOR!}`}</div>
		</div>
	);
};

export default Home;

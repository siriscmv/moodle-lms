import courses from '@utils/courses';
import { diffToHuman, getDueTime, getNextRefresh } from '@utils/date';
import type { Assignment } from '@utils/getAssignments';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type ApiResponse = { lastRefresh: number; assignments: Assignment[] };

const Home: NextPage = () => {
	const [data, setData] = useState<null | ApiResponse>(null);

	useEffect(() => {
		fetch('/api/assignments')
			.then((res) => res.json())
			.then((data: ApiResponse) =>
				setData({ lastRefresh: data.lastRefresh, assignments: data.assignments.sort((a, b) => a.due - b.due) })
			);
	}, []);

	const subscribe = async () => {
		if ('serviceWorker' in navigator) {
			const register = await navigator.serviceWorker.register('/worker.js', {
				scope: '/'
			});

			await navigator.serviceWorker.ready;

			const subscription = await register.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID!)
			});

			await fetch('/api/subscribe', {
				method: 'POST',
				body: JSON.stringify(subscription),
				headers: {
					'content-type': 'application/json'
				}
			});
		}
	};

	return (
		<div className='flex flex-col justify-center items-center p-4 m-4'>
			<h1 className='font-black text-5xl text-center text-primary'>Assigments</h1>
			<div className={`${'text-sm text-white/50 mt-4'}`}>
				{data ? `Last refreshed ${diffToHuman(Date.now() - data!.lastRefresh!)}. Next refresh is in ${getNextRefresh()}` : 'Pulling data...'}
			</div>
			<div className='flex flex-row justify-between p-4 m-4'>
				<Link href='https://github.com/Siris01/moodle-scraper'>
					<a target='_blank' className='bg-primary border-2 text-center border-slate rounded-md text-slate font-semibold p-2 m-2'>
						Star on GitHub
					</a>
				</Link>
				<button
					onClick={() => subscribe()}
					className='bg-primary border-2 text-center border-slate rounded-md text-slate font-semibold p-2 m-2'
				>
					Enable push notifications
				</button>
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
											target='_blank'
											className='p-2 m-2 font-bold bg-primary rounded-md text-black flex flex-col justify-center'
										>
											<span className='inline-block align-middle'>View</span>
										</a>
									</Link>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className='spinner' />
				)}
			</div>
		</div>
	);
};

export default Home;

function urlBase64ToUint8Array(base64String: string) {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

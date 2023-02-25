import courses from '@utils/courses';
import { File } from '@utils/syncFiles';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, } from 'tabler-icons-react';

const Skeleton = () => {
    return (
        <>
            {[1, 2, 3, 4, 5].map((i) => (
                <div className='bg-slate border-2 border-primary p-4 m-4 self-stretch rounded-lg shadow-bottom' key={i}>
                    <div className='flex flex-row justify-between'>
                        <div className='flex flex-col w-48 text-slate'>
                            <div className='animate-pulse m-1 w-24 h-4 bg-white/70 rounded-lg' />
                            <div className='animate-pulse m-1 w-20 h-4 bg-white/40 rounded-lg' />
                            <div className='animate-pulse m-1 w-32 h-4 bg-white/60 rounded-lg' />
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

const Page: NextPage = () => {
    const router = useRouter()
    const { course } = router.query;

    const [files, setFiles] = useState<File[] | null>(null);
    useEffect(() => {
        if (!course) return;
        fetch(`/api/files?course=${course}`)
            .then((res) => {
                if (res.ok) return res.json();
                return Promise.resolve({ files: [] });
            })
            .then(d => setFiles(d.files));
    }, [course]);

    if (!course) return null;
    return (
        <div className='flex flex-col justify-center items-center p-4 m-4'>
            <h1 className='font-black text-5xl text-center text-primary'>
                <b>{courses[parseInt(course as string)]}</b>
            </h1>
            <div className='text-sm text-white/50 text-center mt-4'>
                This content is refreshed once every 24 hours
            </div>
            <div className='flex flex-row justify-between mt-2'>
                <Link
                    className='flex flex-row justify-center items-center bg-primaryBg hover:border-primary border-2 text-center border-primaryBg rounded-md text-primary font-bold p-4 m-4'
                    href='/files'
                >
                    <ArrowLeft />
                    <span className='ml-2'>Go Back</span>
                </Link>
            </div>
            <div className='flex flex-col text-white text-lg self-start p-4'>
                {files ? groupFiles(files).map(topic => {
                    return (
                        <div key={topic.name} className='m-2 p-4'>
                            <h4 className='text-2xl font-bold text-primary'>{topic.name}</h4>
                            <div className='flex flex-wrap justify-start'>
                                {topic.files.map(f => {
                                    return (
                                        <div key={f.id} className='self-strech max-w-md w-full sm:w-md my-2 pr-4'>
                                            <div className='flex flex-row h-full justify-between  border-2 border-primary bg-slate items-center p-4 rounded-md'>
                                                <div className='flex flex-col'>
                                                    <span className='font-bold'>{f.name}</span>
                                                    <div className='text-white/90 text-sm'>
                                                        Modified at {new Date(f.modified * 1000).toDateString()}
                                                    </div>
                                                    <span className='font-light text-sm'>{`Type: ${f.ext}`}</span>
                                                    {
                                                        f.pages ? <span className='font-light text-sm'>{`Pages: ${f.pages}`}</span> : null
                                                    }
                                                </div>
                                                <Link
                                                    target='_blank'
                                                    href={`/api/file?id=${f.id}`}
                                                    className='p-2 m-2 font-bold bg-primaryBg hover:border-primary border-2 border-primaryBg rounded-md text-primary flex flex-col justify-center'
                                                >
                                                    <span className='inline-block align-middle'>
                                                        <ExternalLink />
                                                    </span>
                                                </Link>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>


                    )
                }) : <Skeleton />}
            </div>
            <div className='bottom-4 text-center text-white/90'>{`Made by ${process.env.NEXT_PUBLIC_AUTHOR!}`}</div>
        </div >
    );
};

export default Page;

const groupFiles = (files: File[]) => {
    const groups: { name: string, files: File[] }[] = [];
    const sorted = files.sort((a, b) => a.modified - b.modified);

    for (const f of sorted) {
        const group = groups.find(g => g.name === f.topic);
        if (group) group.files.push(f);
        else groups.push({ name: f.topic, files: [f] });
    }

    return groups.sort((a, b) => a.name.replaceAll(' ', '').localeCompare(b.name.replaceAll(' ', '')));
}
import Link from "next/link";

const LoginPage = () => {
  return (
    <div className='flex flex-col text-center my-auto mt-12 text-white'>
      <h1 className="text-3xl font-bold text-primary">Authentication</h1>
      <span className="font-semibold text-lg p-2 m-2">You must authenticate yourself with an institution email to view this content</span>
      <Link href="/api/login" passHref>
        <button
          className="bg-primaryBg border-2 p-2 m-2 rounded-md text-xl font-bold border-slate hover:border-primary"
        >
          Proceed
        </button>
      </Link>
    </div>
  );
};

export default LoginPage;
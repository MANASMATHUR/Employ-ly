import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

            <div className="blob blob-ruby -top-32 -left-32 opacity-40"></div>
            <div className="blob blob-green -bottom-48 right-0 opacity-30"></div>

            <div className="text-center px-5">

                <div className="relative mb-8">
                    <span className="text-[120px] sm:text-[180px] font-bold text-transparent bg-clip-text bg-gradient-to-br from-[var(--ruby)] to-[var(--parrot)] opacity-20 select-none">
                        404
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl">*</span>
                    </div>
                </div>


                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--cream)] mb-4">
                    Lost in space
                </h1>
                <p className="text-[var(--ash)] mb-8 max-w-sm mx-auto">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved to a different galaxy.
                </p>


                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link href="/" className="btn-primary">
                        Go home
                    </Link>
                    <Link href="/jobs" className="btn-secondary">
                        Browse jobs
                    </Link>
                </div>
            </div>
        </div>
    );
}

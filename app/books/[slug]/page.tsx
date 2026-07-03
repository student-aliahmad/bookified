'use server'

import { redirect } from 'next/navigation';
import { getBookBySlug } from '@/lib/actions/book.actions';
import VapiControls from '@/components/VapiControls';


interface BookPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const page = async ({ params }: BookPageProps) => {
  const { slug } = await params;
  const bookResult = await getBookBySlug(slug);

  if (!bookResult.success || !bookResult.data) {
    redirect('/');
  }

  const { title, author, coverURL, persona } = bookResult.data;
  const book = bookResult.data;
  return (
    <main className="book-page-container mx-auto max-w-4xl px-4 py-10">
      <a href="/" className="back-btn-floating inline-flex items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg p-4 text-slate-700 fixed top-24 left-6 z-20">
        <span className="sr-only">Go back</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </a>

      

      <VapiControls book={book} />
    </main>
  );
};

export default page;

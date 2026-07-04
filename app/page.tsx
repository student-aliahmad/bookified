
import HeroSection from "@/components/HeroSection";
import BookCard from "@/components/BookCard";
import LibrarySearchBar from "@/components/LibrarySearchBar";
import { searchBooks } from "@/lib/actions/book.actions";

export const dynamic = "force-dynamic";

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) => {
  const resolvedSearchParams = await searchParams;

  const query = resolvedSearchParams.q?.trim() ?? '';
  const bookResults = await searchBooks(query)
  const books = bookResults.success ? bookResults.data ?? [] : []

  return (
    <main className="wrapper  pt-15 mb-18 md:mb-16">
      <HeroSection />

      <section className="library-filter-bar mt-4 rounded-[22px] border border-black/10 bg-white/70 px-4 py-4 shadow-[0_1px_0_rgba(0,0,0,0.08)] backdrop-blur-sm sm:px-6 lg:px-7">
        <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[#2d3742] sm:text-[32px]">
          Recent Books
        </h2>

        <LibrarySearchBar initialQuery={query} />
      </section>

      <div className="mt-6 library-books-grid">
        {books.length > 0 ? (
          books.map((book) => (
            <BookCard key={book._id} title={book.title} author={book.author} coverURL={book.coverURL} slug={book.slug} />
          ))
        ) : (
          <div className="col-span-full rounded-[18px] border border-dashed border-black/10 bg-white/60 px-6 py-10 text-center text-[#3d485e] shadow-sm">
            No books matched your search.
          </div>
        )}
      </div>
    </main>
  );
};

export default page;


import { auth } from "@clerk/nextjs/server";
import HeroSection from "@/components/HeroSection";
import BookCard from "@/components/BookCard";
import { getAllBooks } from "@/lib/actions/book.actions";

export const dynamic = "force-dynamic";

const page = async () => {
  const { userId } = await auth();
  console.log("HOMEPAGE USER ID:", userId);
  // Sign in nahi hai to koi book nahi dikhani.
  if (!userId) {
    return (
      <main className="wrapper py-14">
        <HeroSection />
        <section className="mt-6 rounded-xl border bg-white p-8 text-center">
          Please sign in to view your books.
        </section>
      </main>
    );
  }

  const bookResults = await getAllBooks();
   const books = bookResults.success ? bookResults.data ?? [] : [];

  return (
    <main className="wrapper py-14">
      <HeroSection />

      <div className="mt-6 library-books-grid">
        {books.map((book) => (
          <BookCard
            key={String(book._id)}
            title={book.title}
            author={book.author}
            coverURL={book.coverURL}
            slug={book.slug}
          />
        ))}
      </div>
    </main>
  );
};

export default page;
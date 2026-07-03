'use server';

import { CreateBook, TextSegment } from "@/types";
import { connectToDatabase } from "@/database/mongoose";
import { generateSlug, serializeData } from "@/lib/utils";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/bookSegment.model";
import { json } from "zod";
import { Types } from "mongoose";

export const getAllBooks = async () => {
    try {
        await connectToDatabase();

        const books = await Book.find().sort({ createdAt: -1 }).lean();

        return {
            success: true,
            data:  serializeData(books),
        }
    } catch (e) {
        console.error('Errror connecting to database', e);
        return {
            success: false,
            error: e,
        }
    }
}

export const checkBookExists = async (title: string) => {
    try {
        await connectToDatabase();

        const slug = generateSlug(title);
        const existingBook = await Book.findOne({ slug }).lean();



        if (existingBook) {
            
            return {
                exists: true,
                book:  serializeData(existingBook),
            };
        }

        return {
            exists: false,
        };
    } catch (e) {
        console.error('Error checking book exists', e);
        return {
            exists: false,
            error: e instanceof Error ? e.message : String(e),
        };
    }
}

export const createBook = async (data: CreateBook) => {
    try {
        console.log("createBook started");
        await connectToDatabase();
        console.log("MongoDB connected")

        const slug = generateSlug(data.title);
        const existingBook = await Book.findOne({slug}).lean();


        if (existingBook) {
            
            return {
                success: true,
                data: serializeData(existingBook),
                alreadyExists: true,
            }
        }

        // Todo: Check subscription limits before creating a book

        const book = await Book.create({ ...data, slug, totalSegments: 0 });
        console.log("Book created:", book);

        return {
            success: true,
            data:  serializeData(book),
        }

    } catch (e) {
        console.error("Error creating book:", e);
        return {
            success: false,
            error: e instanceof Error ? e.message : String(e),
        }
    }
}

export const getBookBySlug = async (slug: string) => {
    try {
        await connectToDatabase();

        const book = await Book.findOne({ slug }).lean();

        if (!book) {
            return { success: false };
        }

       

        return {
            success: true,
            data:  serializeData(book),
        };
    } catch (e) {
        console.error('Error fetching book by slug', e);
        return {
            success: false,
            error: e instanceof Error ? e.message : String(e),
        };
    }
}

export const searchBookSegments = async (bookId: string, query: string, segmentCount: number = 3) => {
    try {
        await connectToDatabase();

        const normalizedQuery = query?.trim();
        const normalizedSegmentCount = Number.isFinite(segmentCount) ? Math.max(1, Math.min(3, segmentCount)) : 3;

        if (!normalizedQuery || !bookId) {
            return {
                success: true,
                data: []
            };
        }

        const isValidObjectId = Types.ObjectId.isValid(bookId);
        const segments = await BookSegment.find({
            bookId: isValidObjectId ? new Types.ObjectId(bookId) : bookId,
            content: { $regex: normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
        })
            .sort({ segmentIndex: 1 })
            .limit(normalizedSegmentCount)
            .lean();

        return {
            success: true,
            data: serializeData(segments)
        };
    } catch (e) {
        console.error('Error searching book segments', e);
        return {
            success: false,
            error: e instanceof Error ? e.message : String(e),
        };
    }
};

export const saveBookSegments = async (bookId: string, clerkId: string, segments: TextSegment[]) => {
    try {
        await connectToDatabase();

        console.log('Saving book segments...');

        const segemntsToInsert = segments.map(({ text, segmentIndex, wordCount, pageNumber }) => ({
            clerkId, bookId, content: text, segmentIndex, wordCount, pageNumber
        }));

        await BookSegment.insertMany(segemntsToInsert);

        await Book.findByIdAndUpdate(bookId, { totalSegments: segments.length });

        console.log('Book segments saved successfully.');

        return {
            success: true,
            data: { segemntsCreated: segments.length }
        }
    } catch (e) {
        console.error('Error saving book segments', e);

        await BookSegment.deleteMany({ bookId });
        await Book.findByIdAndDelete(bookId);
        console.log('Deleted book segments and book due to failure to save segments.');
        return {
            success: false,
            error: e instanceof Error ? e.message : String(e),
        };
    }
}

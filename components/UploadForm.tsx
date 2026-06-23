'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowUp, ImageIcon, CheckCircle2 } from 'lucide-react'
import { UploadSchema } from '@/lib/zod'
import { MAX_FILE_SIZE } from '@/lib/constants'
import { BookUploadFormValues } from '@/types'
import { useAuth, useUser } from '@clerk/nextjs'
import { toast } from 'sonner';
import { useRouter } from 'next/navigation'
import { checkBookExists, createBook, saveBookSegments } from "@/lib/actions/book.actions";
import { parsePDFFile } from '@/lib/utils';
import { upload } from '@vercel/blob/client';
import { z } from 'zod';

const voiceOptions = [
  { value: 'dave', label: 'Dave', description: 'Young male, British-Essex, casual & conversational' },
  { value: 'daniel', label: 'Daniel', description: 'Middle-aged male, British, authoritative but warm' },
  { value: 'chris', label: 'Chris', description: 'Male, casual & easy-going' },
  { value: 'rachel', label: 'Rachel', description: 'Young female, American, calm & clear' },
  { value: 'sarah', label: 'Sarah', description: 'Young female, American, soft & approachable' },
]

export default function UploadForm() {
  const [submitStatus, setSubmitStatus] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);


  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BookUploadFormValues>({
    resolver: zodResolver(UploadSchema),
    defaultValues: {
      title: '',
      author: '',
      persona: '',
      pdfFile: undefined,
      coverImage: undefined,
    },
  });

  const persona = watch('persona');
  const pdfFile = watch('pdfFile');
  const coverImage = watch('coverImage');

  const onSubmit = async (data: BookUploadFormValues) => {
    console.log("Submitting form");
    console.log(data);
    console.log(data.pdfFile);
    if (!userId) {
      return toast.error("Please login to upload books");
    }
    setIsSubmitting(true);
    try {
      console.log("STEP 1");
      const existsCheck = await checkBookExists(data.title);
      if (existsCheck.exists && existsCheck.book) {
        toast.info("Book with same title already exists.");
        reset()
        router.push(`/books/${existsCheck.book.slug}`);
        return;
      }

      const fileTitle = data.title.replace(/\s+/g, '_').toLowerCase();
      const pdfFile = data.pdfFile;
      console.log("STEP 2");
      const parsedPDF = await parsePDFFile(pdfFile);

      if (parsedPDF.content.length === 0) {
        toast.error("The uploaded PDF file is empty or could not be parsed.");
        return;
      }
      console.log("STEP 3");
      const uploadedPdfBlob = await upload(fileTitle, pdfFile, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        contentType: 'application/pdf'
      });

      let coverUrl: string | undefined;
      let coverBlobKey: string | undefined;

      if (data.coverImage) {
        const coverFile = data.coverImage;

        const uploadedCoverBlob = await upload(
          `${fileTitle}_cover${coverFile.name.substring(coverFile.name.lastIndexOf('.')) || '.png'}`,
          coverFile,
          {
            access: 'public',
            handleUploadUrl: '/api/upload',
            contentType: coverFile.type,
          }
        );

        coverUrl = uploadedCoverBlob.url;
        coverBlobKey = uploadedCoverBlob.pathname;
      } else if (parsedPDF.cover) {
        const coverResponse = await fetch(parsedPDF.cover);
        const coverBlob = await coverResponse.blob();

        const uploadedCoverBlob = await upload(
          `${fileTitle}_cover.png`,
          coverBlob,
          {
            access: 'public',
            handleUploadUrl: '/api/upload',
            contentType: 'image/png',
          }
        );

        coverUrl = uploadedCoverBlob.url;
        coverBlobKey = uploadedCoverBlob.pathname;
      }

      if (!coverUrl) {
        throw new Error('Failed to generate or upload a cover image');
      }

      console.log("STEP 4");
      const book = await createBook({
        clerkId: userId,
        title: data.title,
        author: data.author,
        persona: data.persona,
        fileURL: uploadedPdfBlob.url,
        fileBlobKey: uploadedPdfBlob.pathname,
        coverURL: coverUrl,
        coverBlobKey: coverBlobKey,
        fileSize: pdfFile.size,

      });

      if (!book.success) {
        const message = book.error ? `Failed to create book: ${book.error}` : 'Failed to create book';
        throw new Error(message);
      }

      if (book.alreadyExists) {
        toast.info("Book with same title already exists.");
        reset()
        router.push(`/books/${existsCheck.book.slug}`);
        return;
      }
      console.log("STEP 5");
      const segments = await saveBookSegments(book.data._id, userId, parsedPDF.content);
       console.log("STEP 6");
      if (!segments.success) {
        toast.error("Failed to save book segments");
        throw new Error("Failed to save book segments");
      }

      reset();
      router.push(`/`);
    } catch (error) {
  console.error("FULL ERROR:", error);

  if (error instanceof Error) {
    console.error("MESSAGE:", error.message);
    console.error("STACK:", error.stack);
  }

  toast.error("Failed to upload book. Please try again later.");

  } finally {
    setIsSubmitting(false);
  }
}

if (!isMounted) return null;
return (
  <section className="new-book-wrapper">
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <p className="upload-label">Book PDF File</p>
        <label htmlFor="pdfFileInput" className="upload-panel">
          <ArrowUp className="upload-panel-icon" />
          <div>
            <p className="upload-panel-title">Click to upload PDF</p>
            <p className="upload-panel-subtitle">PDF file (max {MAX_FILE_SIZE / (1024 * 1024)}MB)</p>
            {pdfFile ? (
              <p className="upload-panel-selected-file">Selected file: {pdfFile.name}</p>
            ) : null}
          </div>
          <input
            id="pdfFileInput"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              setValue('pdfFile', file as File, { shouldValidate: true })
            }}
          />
        </label>
        {errors.pdfFile && <p className="text-sm text-red-600">{errors.pdfFile.message}</p>}
      </div>

      <div className="space-y-3">
        <p className="upload-label">Cover Image (Optional)</p>
        <label htmlFor="coverImageInput" className="upload-panel">
          <ImageIcon className="upload-panel-icon" />
          <div>
            <p className="upload-panel-title">Click to upload cover image</p>
            <p className="upload-panel-subtitle">Leave empty to auto-generate from PDF</p>
            {coverImage ? (
              <p className="upload-panel-selected-file">Selected file: {coverImage.name}</p>
            ) : null}
          </div>
          <input
            id="coverImageInput"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              setValue('coverImage', file as File, { shouldValidate: true })
            }}
          />
        </label>
        {errors.coverImage && <p className="text-sm text-red-600">{errors.coverImage.message}</p>}
      </div>

     <form
  onSubmit={handleSubmit(
    onSubmit,
    (errors) => {
      console.log("VALIDATION ERRORS:", errors);
      alert(JSON.stringify(errors, null, 2));
    }
  )}
  className="space-y-6"
>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="form-label">Title</label>
            <input
              id="title"
              type="text"
              placeholder="ex: Rich Dad Poor Dad"
              className="text-input"
              {...register('title')}
            />
            {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="author" className="form-label">Author Name</label>
            <input
              id="author"
              type="text"
              placeholder="ex: Robert Kiyosaki"
              className="text-input"
              {...register('author')}
            />
            {errors.author && <p className="text-sm text-red-600">{errors.author.message}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <p className="upload-label">Choose Assistant Voice</p>
          <div className="voice-group">
            <p className="voice-group-title">Male Voices</p>
            <div className="voice-selector-options">
              {voiceOptions.slice(0, 3).map((option) => {
                const selected = persona === option.value
                return (
                  <label
                    key={option.value}
                    className={`voice-card ${selected ? 'voice-card-selected' : ''}`}
                  >
                    <span className={`voice-card-radio ${selected ? 'voice-card-radio-selected' : ''}`} />
                    <div>
                      <p className="font-semibold text-[#212a3b]">{option.label}</p>
                      <p className="text-sm text-[#3d485e]">{option.description}</p>
                    </div>
                    <input
                      type="radio"
                      value={option.value}
                      className="hidden"
                      {...register('persona')}
                    />
                  </label>
                )
              })}
            </div>
          </div>

          <div className="voice-group">
            <p className="voice-group-title">Female Voices</p>
            <div className="voice-selector-options">
              {voiceOptions.slice(3).map((option) => {
                const selected = persona === option.value
                return (
                  <label
                    key={option.value}
                    className={`voice-card ${selected ? 'voice-card-selected' : ''}`}
                  >
                    <span className={`voice-card-radio ${selected ? 'voice-card-radio-selected' : ''}`} />
                    <div>
                      <p className="font-semibold text-[#212a3b]">{option.label}</p>
                      <p className="text-sm text-[#3d485e]">{option.description}</p>
                    </div>
                    <input
                      type="radio"
                      value={option.value}
                      className="hidden"
                      {...register('persona')}
                    />
                  </label>
                )
              })}
            </div>
          </div>
          {errors.persona && <p className="text-sm text-red-600">{errors.persona.message}</p>}
        </div>

        <button type="submit" className="form-btn w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Processing...' : 'Begin Synthesis'}
        </button>
        {submitStatus ? <p className="text-sm text-[#3d485e]">{submitStatus}</p> : null}
      </form>
    </div>
  </section>
)
}

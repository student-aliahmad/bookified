'use client'

import useVapi from '@/hooks/useVapi'
import { IBook } from '@/types'
import { Mic, X } from 'lucide-react'
import Transcript from './Transcript'

const VapiControls = ({ book } : { book : IBook}) => {
    const {  status, isActive, messages, currentMessage, currentUserMessage, duration, start, stop, clearErrors,} = useVapi(book)
    return (

        <>
          <section className="vapi-header-card bg-[#f3e4c7] rounded-xl p-8 flex flex-col gap-8 md:flex-row md:items-center">
        <div className="relative flex-shrink-0 flex flex-col items-center">
          <img
            src={book.coverURL}
            alt={book.title}
            className="h-auto w-[120px] rounded-xl object-cover shadow-lg"
          />
          <div className="relative mt-4">
            {/*  Pulsating ring when AI is speaking/thinking */}
             {isActive && (status === 'speaking' || status === 'thinking') && (
              <div className="absolute inset-0 inline-flex h-15 w-15 items-center justify-center rounded-full animate-ping">
                <div className="absolute inset-0 rounded-full bg-white opacity-75" />
              </div>
            )}
            {/* { Only show button when active } */}
             {isActive && (
              <button onClick={stop} disabled={status === 'connecting'} type="button" className="vapi-mic-btn inline-flex h-15 w-15 items-center justify-center rounded-full bg-white shadow-xl ring-1 ring-slate-200 z-10" aria-label="End session">
                <X className="h-6 w-6 text-slate-700" />
              </button>
            )} 
            {/* Only show start button when inactive */}
              {!isActive && (
              <button onClick={start} disabled={status === 'connecting'} type="button" className="vapi-mic-btn inline-flex h-15 w-15 items-center justify-center rounded-full bg-white shadow-xl ring-1 ring-slate-200 z-10" aria-label="Start conversation">
                <Mic className="h-6 w-6 text-slate-700" />
              </button>
            )}
          </div>
        </div>    
          
          


         <div className="flex-1">
          <h1 className="text-3xl font-serif font-bold text-slate-900 md:text-4xl">{book.title}</h1>
          <p className="mt-2 text-sm text-slate-600">by {book.author}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            <span className="vapi-status-indicator inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm shadow-sm">
              <span className="vapi-status-dot inline-block h-2.5 w-2.5 rounded-full bg-slate-400" />
              <span className="vapi-status-text text-slate-700">Ready</span>
            </span>
            <span className="vapi-status-indicator inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm shadow-sm">
              <span className="vapi-status-text text-slate-700">Voice: {book.persona}</span>
            </span>
            <span className="vapi-status-indicator inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm shadow-sm">
              <span className="vapi-status-text text-slate-700">0:00/15:00</span>
            </span>
          </div>
        </div>
      
            </section>  
          
      <div className="vapi-transcript-wrapper mt-8">
        <Transcript 
          messages={messages} 
          currentMessage={currentMessage}
          currentUserMessage={currentUserMessage}
          currentMessageContent={currentMessage}
          currentUserMessageContent={currentUserMessage}
        />
      </div>
        
        </>
        
    )
}

export default VapiControls

import { useCallback, useEffect, useRef, useState } from 'react'

export default function ImageCarousel({ slides, interval = 5000, className = '', onIndexChange }) {
  const [index, setIndex] = useState(0)
  const timerRef = useRef(null)
  const touchStartX = useRef(null)

  useEffect(() => { onIndexChange?.(index) }, [index])

  const goTo = useCallback(i => {
    setIndex(((i % slides.length) + slides.length) % slides.length)
  }, [slides.length])

  const next = useCallback(() => goTo(index + 1), [goTo, index])
  const prev = useCallback(() => goTo(index - 1), [goTo, index])

  useEffect(() => {
    if (slides.length <= 1) return
    timerRef.current = setInterval(() => setIndex(i => (i + 1) % slides.length), interval)
    return () => clearInterval(timerRef.current)
  }, [slides.length, interval, index])

  const pause = () => clearInterval(timerRef.current)
  const resume = () => {
    clearInterval(timerRef.current)
    if (slides.length > 1) {
      timerRef.current = setInterval(() => setIndex(i => (i + 1) % slides.length), interval)
    }
  }

  const onTouchStart = e => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = e => {
    if (touchStartX.current == null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (delta > 40) prev()
    else if (delta < -40) next()
    touchStartX.current = null
  }

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${className}`}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((slide, i) => (
        <img
          key={slide.image}
          src={slide.image}
          alt={slide.label || ''}
          className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ease-in-out ${slide.fit === 'contain' ? 'object-contain' : 'object-cover'}`}
          style={{
            opacity: i === index ? 1 : 0,
            objectPosition: slide.position || '68% center',
            filter: slide.filter || 'none',
          }}
        />
      ))}

      {/* Prev / Next arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm border border-gold/30 shadow-md flex items-center justify-center text-charcoal hover:bg-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm border border-gold/30 shadow-md flex items-center justify-center text-charcoal hover:bg-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.image}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-gold' : 'w-1.5 bg-white/70 hover:bg-white'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

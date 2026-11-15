import './style.css'
import { movies } from './movies.ts'
import type { Movie } from './movies.ts'

const posterThemeClasses = {
  red: 'film-poster--red',
  light: 'film-poster--light',
  deep: 'film-poster--deep'
} as const

function createSpan(className: string, text?: string): HTMLSpanElement {
  const span = document.createElement('span')
  span.className = className

  if (text) {
    span.textContent = text
  }

  return span
}

function createFilmCard(movie: Movie): HTMLElement {
  const card = document.createElement('article')
  card.className = 'film-card'

  const poster = document.createElement('div')
  poster.className = `film-poster ${posterThemeClasses[movie.poster.theme]}`

  const image = document.createElement('img')
  image.className = 'film-poster__image'
  image.src = movie.poster.small
  image.srcset = `${movie.poster.small} 600w, ${movie.poster.large} 1200w`
  image.sizes = '(min-width: 1024px) 300px, 90vw'
  image.width = 600
  image.height = 900
  image.alt = `Póster de ${movie.title}`
  image.loading = 'lazy'
  poster.append(image)

  const fallback = document.createElement('div')
  fallback.className = 'film-poster__fallback'
  fallback.append(createSpan('film-title', movie.poster.fallbackTitle))
  poster.append(fallback)

  if (movie.trailerId) {
    poster.classList.add('film-poster--has-trailer')

    const trailerOverlay = document.createElement('div')
    trailerOverlay.className = 'film-poster__trailer'

    const playButton = document.createElement('button')
    playButton.className = 'film-poster__play'
    playButton.type = 'button'
    playButton.setAttribute('aria-label', `Ver tráiler de ${movie.title}`)
    playButton.addEventListener('click', () => openTrailer(movie))

    const playIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    playIcon.setAttribute('viewBox', '0 0 24 24')
    playIcon.setAttribute('fill', 'none')
    playIcon.setAttribute('aria-hidden', 'true')
    const playPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    playPath.setAttribute('d', 'M7 5.75v12.5L17 12 7 5.75Z')
    playPath.setAttribute('fill', 'currentColor')
    playIcon.append(playPath)
    playButton.append(playIcon)
    trailerOverlay.append(playButton, createSpan('film-poster__trailer-label', 'Ver tráiler'))
    poster.append(trailerOverlay)
  }

  const metadata = document.createElement('div')
  metadata.className = 'film-meta'
  metadata.append(
    createSpan('film-name', movie.title),
    createSpan('film-detail', `${movie.year} · ${movie.genre} · Dir. ${movie.director}`)
  )

  card.append(poster, metadata)
  return card
}

const trailerDialog = document.querySelector<HTMLDialogElement>('#trailer-dialog')
const trailerFrame = document.querySelector<HTMLIFrameElement>('#trailer-frame')
const trailerCloseButton = document.querySelector<HTMLButtonElement>('.trailer-dialog__close')

if (!trailerDialog || !trailerFrame || !trailerCloseButton) {
  throw new Error('Expected the trailer dialog elements to exist in the document.')
}

function openTrailer(movie: Movie): void {
  if (trailerFrame) {
    trailerFrame.title = `Tráiler de ${movie.title}`
    if (movie.trailerId) {
      trailerFrame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(movie.trailerId)}?autoplay=1&rel=0`
    }
  }
  if (trailerDialog) trailerDialog.showModal()
}

trailerCloseButton.addEventListener('click', () => trailerDialog.close())
trailerDialog.addEventListener('close', () => {
  trailerFrame.src = ''
})

const catalogGrid = document.querySelector<HTMLElement>('#catalog-grid')

if (!catalogGrid) {
  throw new Error('Expected #catalog-grid to exist in the document.')
}

const filmCards = document.createDocumentFragment()
movies.forEach((movie) => filmCards.append(createFilmCard(movie)))
catalogGrid.append(filmCards)

document.querySelectorAll<HTMLImageElement>('.film-poster__image').forEach((image) => {
  const showFallback = () => {
    image.closest('.film-poster')?.classList.add('film-poster--fallback')
  }

  image.addEventListener('error', showFallback, { once: true })

  if (image.complete && image.naturalWidth === 0) {
    showFallback()
  }
})

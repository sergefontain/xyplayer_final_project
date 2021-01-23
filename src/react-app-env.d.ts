/// <reference types="react-scripts" />
declare module "*.mp3" {
  const src: string
  export default src
}

interface RefObject<T> {
  // immutable
  readonly current: T | null
}

declare module 'react-double-marquee'
declare module 'html5-file-selector'



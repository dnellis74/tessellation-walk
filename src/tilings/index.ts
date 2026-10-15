import { generatePenrose } from './aperiodic/penrose'
import { generateHexagon, generateSquare, generateTriangle } from './regular'
import type { GenerateOptions, TilingPattern, TileGraph } from './types'
import { generateBrick, generateHerringbone, generateRhombille } from './wallpaper'

export * from './types'

export function generateTiling(pattern: TilingPattern, options: GenerateOptions): TileGraph {
  switch (pattern) {
    case 'square':
      return generateSquare(options)
    case 'triangle':
      return generateTriangle(options)
    case 'hexagon':
      return generateHexagon(options)
    case 'brick':
      return generateBrick(options)
    case 'herringbone':
      return generateHerringbone(options)
    case 'rhombille':
      return generateRhombille(options)
    case 'penrose':
      return generatePenrose(options)
  }
}

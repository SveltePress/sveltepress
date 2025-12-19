import type { Plugin } from 'unified'
import fs from 'node:fs'
import path from 'node:path'
import { visit } from 'unist-util-visit'

interface ProcessedImage {
  importName: string
  importPath: string
}

// Supported web image formats
const SUPPORTED_FORMATS = new Set([
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'avif',
  'heic',
  'heif',
  'svg',
  'svgz',
  'ico',
  'icns',
])

function isSupportedFormat(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase().slice(1)
  return SUPPORTED_FORMATS.has(ext)
}

function isLocalPath(url: string): boolean {
  const result = !/^https?:|^\/|data:|#/.test(url) && !url.startsWith('mailto:')
  return result
}

function resolveImagePath(markdownPath: string, imagePath: string): string {
  const markdownDir = path.dirname(markdownPath)
  const resolved = path.resolve(markdownDir, imagePath)
  return resolved
}

function extractFilenameFromPath(imageUrl: string): string {
  // Get filename without path and extension
  const filename = path.basename(imageUrl)
  const nameWithoutExt = path.parse(filename).name

  // Clean up: replace underscores and hyphens with spaces, remove extra spaces
  return nameWithoutExt
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function explicitRelativePath(filePath: string): string {
  return filePath.startsWith('.') ? filePath : `./${filePath}`
}

const markdownImagesPlugin: Plugin<any[], any> = () => {
  return (tree: any, file: any) => {
    const images: ProcessedImage[] = []
    const filePath = file.history[0] || file.path

    visit(tree, (node: any) => {
      const isImageNode = node.type === 'image' && typeof node.url === 'string'
      if (!isImageNode) {
        return
      }

      if (!isLocalPath(node.url)) {
        return
      }

      if (!isSupportedFormat(node.url)) {
        console.warn(`⚠️  File ${node.url} exists but is not a supported image format`)
        return
      }

      const resolvedPath = resolveImagePath(filePath, node.url)

      if (!fs.existsSync(resolvedPath)) {
        // File doesn't exist - throw error to break the build
        console.error(`❌ Image file not found: ${node.url} (resolved to ${resolvedPath})`)
        throw new Error(`Image file not found: ${node.url} at ${resolvedPath}`)
      }

      const importName = `SPRESS_IMAGE_${images.length}`
      const importPath = explicitRelativePath(node.url)

      if (!node.alt) {
        node.alt = extractFilenameFromPath(node.url)
      }

      // Set the image URL to the import name (braces added later)
      node.url = importName

      images.push({
        importName,
        importPath,
      })
    })

    // Store processed images in file.data for later use
    if (images.length > 0) {
      file.data ??= {}
      file.data.images = images
    }

    return tree
  }
}

export default markdownImagesPlugin

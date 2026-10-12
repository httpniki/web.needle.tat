export default function extractPublicId(url: string): string | null {
   try {
      const parts = url.split('/')
      const uploadIndex = parts.indexOf('upload')
      if (uploadIndex === -1) return null

      let relevantParts = parts.slice(uploadIndex + 1)
      if (relevantParts[0].match(/^v\d+$/)) relevantParts = relevantParts.slice(1)

      const pathWithExtension = relevantParts.join('/')
      return pathWithExtension.replace(/\.[^/.]+$/, '')
   } catch {
      return null
   }
}

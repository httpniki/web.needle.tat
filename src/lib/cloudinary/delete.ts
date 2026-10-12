import { v2 as cloudinary } from 'cloudinary'

import extractPublicId from './utils'

export async function deleteFromCloudinary(url: string): Promise<void> {
   const publicId = extractPublicId(url)
   if (!publicId) return
   await cloudinary.uploader.destroy(publicId)
}

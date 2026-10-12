import { v2 as cloudinary } from 'cloudinary'

export async function uploadFile(file: File): Promise<string> {
   const bytes = await file.arrayBuffer()
   const buffer = Buffer.from(bytes)

   return new Promise<string>((resolve, reject) => {
      cloudinary.uploader
         .upload_stream(
            {
               folder: 'needle',
               unique_filename: true,
               public_id: crypto.randomUUID(),
            },
            (err, result) => {
               if (err || !result?.secure_url) return reject(err)
               resolve(result.secure_url)
            }
         )
         .end(buffer)
   })
}

/**
 * Image Optimization Utilities
 * Reduces database bucket pressure and costs through compression and optimization
 */

// Image compression utility
export const compressImage = (file, options = {}) => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    format = 'image/jpeg'
  } = options

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob], file.name, {
            type: format,
            lastModified: Date.now()
          })
          resolve(compressedFile)
        },
        format,
        quality
      )
    }

    img.src = URL.createObjectURL(file)
  })
}

// Generate thumbnail
export const generateThumbnail = (file, size = 150) => {
  return compressImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: 'image/jpeg'
  })
}

// Image format converter
export const convertImageFormat = (file, targetFormat = 'image/webp') => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      canvas.toBlob(
        (blob) => {
          const convertedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), {
            type: targetFormat,
            lastModified: Date.now()
          })
          resolve(convertedFile)
        },
        targetFormat,
        0.9
      )
    }

    img.src = URL.createObjectURL(file)
  })
}

// Batch process multiple images
export const processImages = async (files, options = {}) => {
  const {
    enableCompression = true,
    enableThumbnail = true,
    enableFormatConversion = true,
    targetFormat = 'image/webp'
  } = options

  const processedFiles = []
  const thumbnails = []

  for (const file of files) {
    let processedFile = file

    // Convert format first (WebP is more efficient)
    if (enableFormatConversion && file.type !== targetFormat) {
      try {
        processedFile = await convertImageFormat(processedFile, targetFormat)
      } catch (error) {
        console.warn('Format conversion failed, using original:', error)
      }
    }

    // Compress main image
    if (enableCompression) {
      try {
        processedFile = await compressImage(processedFile)
      } catch (error) {
        console.warn('Compression failed, using original:', error)
      }
    }

    processedFiles.push(processedFile)

    // Generate thumbnail
    if (enableThumbnail) {
      try {
        const thumbnail = await generateThumbnail(file)
        thumbnails.push(thumbnail)
      } catch (error) {
        console.warn('Thumbnail generation failed:', error)
      }
    }
  }

  return { processedFiles, thumbnails }
}

// Get optimized image URL with size parameters
export const getOptimizedImageUrl = (imageId, options = {}) => {
  const {
    width = 800,
    height = 600,
    quality = 80
  } = options

  if (!imageId) return null

  // Use Appwrite storage URL format
  const baseUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID}/files/${imageId}/view`

  // Add query parameters for optimization (Appwrite doesn't support these, but keeping for future enhancement)
  const params = new URLSearchParams({
    project: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    w: width.toString(),
    h: height.toString(),
    q: quality.toString()
  })

  return `${baseUrl}?${params.toString()}`
}

// Validate image file
export const validateImageFile = (file) => {
  const maxSize = 10 * 1024 * 1024 // 10MB (increased for original files)
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`শুধুমাত্র ${allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} ফরম্যাট সাপোর্টেড`)
  }

  if (file.size > maxSize) {
    throw new Error(`ছবির সাইজ ${(maxSize / 1024 / 1024).toFixed(1)}MB এর বেশি হতে পারবে না`)
  }

  return true
}

// Image lazy loading utility
export const setupLazyLoading = (imageRef, src) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = src
          img.classList.remove('lazy')
          observer.unobserve(img)
        }
      })
    },
    { threshold: 0.1 }
  )

  if (imageRef.current) {
    observer.observe(imageRef.current)
  }

  return () => observer.disconnect()
}
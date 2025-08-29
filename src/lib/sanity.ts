import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: 'kxqfasm6',
  dataset: 'production',
  apiVersion: '2024-01-01', // Use today's date or your preferred version
  useCdn: false, // Set to false for development, true for production
  token: process.env.SANITY_TOKEN, // Optional: for authenticated requests
})

// Image URL builder for Sanity images
export const imageBuilder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return imageBuilder.image(source)
}

// Helper function to get all documents of a specific type
export async function getAllDocuments(type: string) {
  return await client.fetch(`*[_type == "${type}"]`)
}

// Helper function to get a single document by slug
export async function getDocumentBySlug(type: string, slug: string) {
  return await client.fetch(`*[_type == "${type}" && slug.current == "${slug}"][0]`)
}

// Helper function to get documents with pagination
export async function getDocumentsWithPagination(type: string, limit: number = 10, offset: number = 0) {
  return await client.fetch(`*[_type == "${type}"] | order(_createdAt desc) [${offset}...${offset + limit}]`)
}

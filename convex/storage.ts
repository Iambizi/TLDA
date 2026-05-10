import { mutation } from './_generated/server'
import { getAuthUserId } from '@convex-dev/auth/server'

async function requireOrganizer(ctx: { auth: any }) {
  const userId = await getAuthUserId(ctx)
  if (!userId) throw new Error('Unauthorized')
  return userId
}

/**
 * Generate a short-lived upload URL for the frontend to upload a file directly to Convex Storage.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireOrganizer(ctx)
    return await ctx.storage.generateUploadUrl()
  },
})

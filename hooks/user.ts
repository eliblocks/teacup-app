import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { useAuth } from '@/ctx';


export function useUser() {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['me', token],
    enabled: !!token,
    queryFn: async () => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/me?token=${token}`,
      )
      if (!response.ok) {
        throw new Error('Failed to fetch current user')
      }
      return await response.json()
    },
  })
}


export function useUpdateUser() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ bio, fullName, avatarUri }: { bio: string; fullName: string; avatarUri?: string | null }) => {
      const formData = new FormData()
      formData.append('token', token!)
      formData.append('full_name', fullName)
      formData.append('bio', bio)

      if (avatarUri) {
        const filename = avatarUri.split('/').pop() ?? 'avatar.jpg'
        const match = /\.(\w+)$/.exec(filename)
        const ext = match?.[1] ?? 'jpg'
        const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`

        formData.append('avatar', {
          uri: avatarUri,
          name: filename,
          type: mimeType,
        } as any)
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/me`,
        {
          method: 'PATCH',
          body: formData,
        },
      )
      if (!response.ok) {
        throw new Error('Failed to update profile')
      }
      return await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me', token] })
    },
  })
}

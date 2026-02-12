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
    mutationFn: async ({ bio, fullName }: { bio: string; fullName: string }) => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/me`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, full_name: fullName, bio }),
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

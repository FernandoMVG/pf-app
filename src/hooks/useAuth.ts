import { useAuth as useClerkAuth } from '@clerk/clerk-react'

export const useAuth = () => {
  const { getToken, userId, isSignedIn, isLoaded } = useClerkAuth()

  const getAuthHeaders = async () => {
    if (!isSignedIn || !userId) {
      throw new Error('Usuario no autenticado')
    }

    const token = await getToken()
    
    return {
      'Authorization': `Bearer ${token}`,
      'X-User-ID': userId,
      'Content-Type': 'application/json'
    }
  }

  return {
    getAuthHeaders,
    userId,
    isSignedIn,
    isLoaded
  }
}

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const login = async (credentials) => {
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      const fakeToken = 'fake-jwt-token'
      const fakeUser = {
        username: credentials.username,
        role: 'admin'
      }
      
      token.value = fakeToken
      user.value = fakeUser
      localStorage.setItem('token', fakeToken)
      localStorage.setItem('user', JSON.stringify(fakeUser))
      return true
    }
    
    throw new Error('用户名或密码错误')
  }
  
  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const isAuthenticated = () => !!token.value

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout
  }
}) 
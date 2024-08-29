import { reToken } from '@/api/user'

export default async function tokenCheck() {
  if (
    Date.now() + 5 * 60 * 1000 >=
    JSON.parse(localStorage.getItem('login')).exp
  ) {
    const res = await reToken()
    localStorage.setItem(
      'login',
      JSON.stringify({
        token: res,
        exp: Date.now() + 30 * 60 * 1000
      })
    )
  }
}

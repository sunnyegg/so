
export default async function useLogout(token: string): Promise<boolean> {
  let url = `${process.env.NEXT_PUBLIC_APP_URL}/auth/logout`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${token}`,
    }
  })

  if (!res.ok) {
    return false;
  }

  return true;
}
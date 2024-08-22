import browserStorage from 'store';

export default async function useLogout(token: string): Promise<boolean> {
  let url = `${process.env.NEXT_PUBLIC_APP_URL}/auth/logout`;

  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      refresh_token: token,
    }),
  })

  browserStorage.clearAll();

  if (!res.ok) {
    return false;
  }

  return true;
}
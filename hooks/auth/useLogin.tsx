type StateResponse = {
  url: string;
}

export default async function useLogin(): Promise<Error | void> {
  let url = `${process.env.NEXT_PUBLIC_APP_URL}/auth/state`;

  const stateRes = await fetch(url, {
    method: 'GET',
  })

  if (!stateRes.ok) {
    return new Error('Failed to fetch state');
  }

  const state = await stateRes.json() as StateResponse;
  console.log(state.url);
}
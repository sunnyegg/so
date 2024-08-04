type StateResponse = {
  url: string;
}

type LoginResponse = {
  error: string;
  data: string;
}

export default async function useLogin(): Promise<LoginResponse> {
  let url = `${process.env.NEXT_PUBLIC_APP_URL}/auth/state`;

  const stateRes = await fetch(url, {
    method: 'GET',
  })

  if (!stateRes.ok) {
    return {
      error: "Failed to get state",
      data: "",
    }
  }

  const state = await stateRes.json() as StateResponse;
  return {
    error: "",
    data: state.url,
  }
}
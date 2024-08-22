import { CommonResponse, GetAttendanceResponse, GetAttendanceResponseData } from "../types";

export const createAttendance = async (token: string, userLogin: string, presentAt: string, streamId: number): Promise<CommonResponse> => {
  let url = `${process.env.NEXT_PUBLIC_APP_URL}/attendance_members`;
  let output: CommonResponse = {
    error: "",
    data: "",
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
    },
    body: JSON.stringify({
      username: userLogin,
      present_at: presentAt,
      stream_id: streamId,
    }),
  })

  if (!res.ok) {
    const { error } = await res.json()
    output.error = error;
    return output
  }

  output.data = "Successfully created attendance";

  return output
}

export const getAttendance = async (token: string, streamId: number): Promise<GetAttendanceResponse> => {
  let url = `${process.env.NEXT_PUBLIC_APP_URL}/streams/attendance_members?stream_id=${streamId}&page_id=1&page_size=10000`;
  let output: GetAttendanceResponse = {
    error: "",
    data: [],
  }

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `bearer ${token}`,
    },
  })

  if (!res.ok) {
    const { error } = await res.json()
    output.error = error;
    return output
  }

  const data = await res.json() as GetAttendanceResponseData[];
  output.data = data;

  return output
}
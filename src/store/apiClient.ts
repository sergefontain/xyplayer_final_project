
export const ENDPOINT = `http://player.asmer.fs.a-level.com.ua`
export const ENDPOINT_GRAPHQL = `${ENDPOINT}/graphql`
export const ENDPOINT_UPLOAD = `${ENDPOINT}/track`

interface Headers {
  Authorization: string
}

interface Params {
  headers: Headers
}

export const myFetch = async (
  query: any,
  variables: {},
  params?: Params
): Promise<any> => {
  if (params) {
    const response = await fetch(ENDPOINT_GRAPHQL, {
      method: "POST",
      body: JSON.stringify({
        query,
        variables,
      }),
      headers: {
        "content-type": "application/json",
        Authorization: params.headers.Authorization,
      },
    })
    const { data } = await response.json()
    return data
  } else {
    const response = await fetch(ENDPOINT_GRAPHQL, {
      method: "POST",
      body: JSON.stringify({
        query,
        variables,
      }),
      headers: {
        "content-type": "application/json",
      },
    })
    const { data } = await response.json()
    return data
  }
}

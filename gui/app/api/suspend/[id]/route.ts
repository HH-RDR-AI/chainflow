import { NextRequest, NextResponse } from 'next/server'

const handler = async (req: Request, { params }: any) => {
  const { searchParams } = new URL(req.url)
  const requestUrl = params?.slug?.join('/') || ''

  const query = Object.entries(Object.fromEntries(searchParams))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  const url = `http://localhost:8080/engine-rest/${requestUrl}${query ? `?${query}` : ''}`

  try {
    const result = await fetch(url, {
      headers: {
        Authorization: 'Basic ' + btoa('demo' + ':' + 'demo'),
      },
      method: req.method,
      body: req.body,
    })

    if (!result.ok) {
      return NextResponse.json(
        {
          url: requestUrl,
          message: result.statusText,
          status: result.status,
          body: await result.json(),
        },
        {
          status: result.status,
        }
      )
    }

    return NextResponse.json(await result.json(), { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ message: e.message, status: 500 }, { status: 500 })
  }
}

export const GET = async (req: Request, { params }: any) => {
  const res = await fetch(
    'http://localhost:8080/engine-rest/process-instance/24a2babc-70e5-11ee-b04b-c25fdcea4e8d/suspended',
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ suspended: false }),
    }
  )

  console.log(await res.json())
}

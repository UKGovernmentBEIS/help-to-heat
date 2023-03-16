import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { payload } = req.body
  const PORTAL_URL = process.env.PORTAL_URL

  try {
    await fetch(`${PORTAL_URL}/api/referral/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }).then((response) => {
      return response.json()
    })

    res.status(200).json({
      message: 'Success'
    })
    return
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
    return
  }
}

export default handler
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { formatISO } from 'date-fns';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const closedDays = await db.closedDay.findMany();
    const formattedClosedDays = closedDays.map((d) => formatISO(d.date));

    res.status(200).json(formattedClosedDays);
  } catch (error) {
    console.error('Error fetching closed days:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

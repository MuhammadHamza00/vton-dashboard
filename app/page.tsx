// app/page.tsx
'use client';

import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login'); // Automatically send users to login
}

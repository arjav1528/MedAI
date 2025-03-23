import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const client = await clientPromise;
    const db = client.db();
    
    // Check if we can access the users collection
    const usersCount = await db.collection('users').countDocuments();
    
    return NextResponse.json({
      status: 'success',
      session: session,
      dbConnected: true,
      usersCount,
    });
  } catch (error) {
    console.error('Debug auth error:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      dbConnected: false,
    }, { status: 500 });
  }
}
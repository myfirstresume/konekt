import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { encryptMessage, decryptMessage, generateUserKey } from '@/utils/encryption';

// GET - Retrieve chat messages for a user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the latest session token for this user
    const latestSession = await prisma.session.findFirst({
      where: { userId: user.id },
      orderBy: { expires: 'desc' }
    });

    // Generate encryption key
    const key = generateUserKey(user.id, latestSession?.sessionToken);

    // Retrieve encrypted messages
    const encryptedMessages = await prisma.chatMessage.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: 'asc' }
    });

    // Decrypt messages
    const decryptedMessages = encryptedMessages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: decryptMessage(msg.content, key),
      timestamp: msg.timestamp,
      relatedCommentId: msg.relatedCommentId,
      resumeVersionId: msg.resumeVersionId
    }));

    return NextResponse.json({ messages: decryptedMessages });

  } catch (error) {
    console.error('Error retrieving chat messages:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve chat messages' },
      { status: 500 }
    );
  }
}

// POST - Save a new chat message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, content, relatedCommentId, resumeVersionId } = await request.json();

    if (!role || !content) {
      return NextResponse.json({ error: 'Role and content are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the latest session token for this user
    const latestSession = await prisma.session.findFirst({
      where: { userId: user.id },
      orderBy: { expires: 'desc' }
    });

    // Generate encryption key
    const key = generateUserKey(user.id, latestSession?.sessionToken);

    // Encrypt the message content
    const encryptedContent = encryptMessage(content, key);

    // Save the encrypted message
    const savedMessage = await prisma.chatMessage.create({
      data: {
        userId: user.id,
        role,
        content: encryptedContent,
        relatedCommentId,
        resumeVersionId
      }
    });

    return NextResponse.json({
      id: savedMessage.id,
      role: savedMessage.role,
      content: content, // Return the original content for immediate use
      timestamp: savedMessage.timestamp,
      relatedCommentId: savedMessage.relatedCommentId,
      resumeVersionId: savedMessage.resumeVersionId
    });

  } catch (error) {
    console.error('Error saving chat message:', error);
    return NextResponse.json(
      { error: 'Failed to save chat message' },
      { status: 500 }
    );
  }
}

// DELETE - Clear all chat messages for a user
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete all chat messages for this user
    await prisma.chatMessage.deleteMany({
      where: { userId: user.id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error clearing chat messages:', error);
    return NextResponse.json(
      { error: 'Failed to clear chat messages' },
      { status: 500 }
    );
  }
}

import {NextResponse, NextRequest} from 'next/server';
import {
  aceptarSolicitud,
  getAllAmigos,
  eliminarAmigo,
} from '@/lib/controllers/user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.headers.get('token') as string;
    const user = await aceptarSolicitud(token, body);
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({message: 'Token Incorrecto'});
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('token') as string;
    const user = await getAllAmigos(token);
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({message: 'Token Incorrecto'});
  }
}
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('token') as string;
    const body = await request.json();
    const user = await eliminarAmigo(token, body);
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({message: 'Token Incorrecto'});
  }
}

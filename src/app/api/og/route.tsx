import { ImageResponse } from 'next/og';
import { prisma } from '@/utils/prisma';



export async function GET() {
  try {
    const profile = await prisma.profileInfo.findFirst();
    const name = profile?.name || "Creative Developer";
    const tagline = profile?.tagline || "Building Digital Experiences";

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #333 2%, transparent 0%), radial-gradient(circle at 75px 75px, #333 2%, transparent 0%)',
            backgroundSize: '100px 100px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '60px 100px',
              borderRadius: '24px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <h1
              style={{
                fontSize: 80,
                fontWeight: 900,
                color: 'white',
                marginBottom: 20,
                letterSpacing: '-0.05em',
              }}
            >
              {name}
            </h1>
            <p
              style={{
                fontSize: 40,
                color: '#888',
                margin: 0,
              }}
            >
              {tagline}
            </p>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
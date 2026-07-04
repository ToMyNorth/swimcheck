import { ImageResponse } from 'next/og'

// Image metadata
export const alt = 'StrokeLab - AI Swimming Stroke Analysis'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// Image generation
export default async function Image() {
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
          background:
            'linear-gradient(135deg, #0c1929 0%, #0f2744 25%, #134e6f 50%, #0e7c7b 75%, #14b8a6 100%)',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Decorative wave layers */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 200,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          {/* Wave 1 - back */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              left: -100,
              right: -100,
              height: 180,
              borderRadius: '50% 50% 0 0',
              background:
                'linear-gradient(180deg, rgba(20, 184, 166, 0.15) 0%, rgba(20, 184, 166, 0.05) 100%)',
            }}
          />
          {/* Wave 2 - middle */}
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              left: -50,
              right: -150,
              height: 150,
              borderRadius: '50% 50% 0 0',
              background:
                'linear-gradient(180deg, rgba(56, 189, 248, 0.12) 0%, rgba(56, 189, 248, 0.04) 100%)',
            }}
          />
          {/* Wave 3 - front */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: -150,
              right: -50,
              height: 120,
              borderRadius: '50% 50% 0 0',
              background:
                'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
            }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, rgba(56, 189, 248, 0) 70%)',
          }}
        />

        {/* Bottom-left decorative circle */}
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 260,
            height: 260,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(20, 184, 166, 0.2) 0%, rgba(20, 184, 166, 0) 70%)',
          }}
        />

        {/* Small floating dots for water bubble effect */}
        <div
          style={{
            position: 'absolute',
            top: 120,
            left: 160,
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: 'rgba(56, 189, 248, 0.4)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 200,
            left: 280,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'rgba(56, 189, 248, 0.3)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 90,
            right: 240,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'rgba(20, 184, 166, 0.35)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 180,
            right: 160,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: 'rgba(56, 189, 248, 0.25)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 180,
            left: 400,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.15)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 220,
            right: 380,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.12)',
          }}
        />

        {/* Main content container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Swim lane icon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            {/* Simplified swimmer icon using CSS */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                border: '3px solid rgba(56, 189, 248, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  lineHeight: 1,
                }}
              >
                🏊
              </div>
            </div>
          </div>

          {/* Brand name */}
          <div
            style={{
              fontSize: 80,
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-2px',
              lineHeight: 1,
              marginBottom: 16,
              display: 'flex',
            }}
          >
            Stroke
            <span style={{ color: '#38bdf8' }}>Lab</span>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.9)',
              letterSpacing: '1px',
              marginBottom: 24,
            }}
          >
            AI Swimming Stroke Analysis
          </div>

          {/* Divider line */}
          <div
            style={{
              width: 80,
              height: 3,
              background:
                'linear-gradient(90deg, #38bdf8 0%, #14b8a6 100%)',
              borderRadius: 2,
              marginBottom: 24,
            }}
          />

          {/* Description */}
          <div
            style={{
              fontSize: 22,
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: 1.5,
              textAlign: 'center',
              maxWidth: 700,
            }}
          >
            Upload your swim photos. Get instant AI coaching feedback.
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.2)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.85)',
              marginRight: 16,
            }}
          >
            strokelab.app
          </div>
          <div
            style={{
              fontSize: 16,
              color: 'rgba(255, 255, 255, 0.45)',
            }}
          >
            Free to try · No signup required
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

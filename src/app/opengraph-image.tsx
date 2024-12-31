import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Michael DeMarco'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#800020',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="200"
          height="200"
          viewBox="0 0 1024 1024"
          xmlns="http://w3.org/2000/svg"
        >
          <rect x="509.3" y="354.3" width="51.8" height="236.3" />
          <path d="M560.8,560.7v294.6c-0.1,62.2-12.4,102.7-47,132c-31.6,26-83.5,36.7-121.6,36.7l-7.3-46.1c32.4-2,60.8-9.4,77.8-24.7 c17.3-16.7,25-38.6,26.5-97.8c0.2-7.3,0.3-15.3,0.3-23.9V619.9c0.9-20,4.1-39.9,9.5-59.2H560.8z" />
          <rect x="489.1" y="141.4" width="71.9" height="268.9" />
          <path d="M524.7,91.7c29.4,0,47-21,46.1-45.5c0-26.1-17.6-46.3-44.5-46.3c-27.7,0-47,20.2-47,46.3C479.4,70.7,497,91.7,524.7,91.7z" />
        </svg>
      </div>
    ),
    { ...size }
  )
}

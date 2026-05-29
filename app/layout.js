export const metadata = { title: 'StakeArena', description: 'Challenge. Stake. Win.' }
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#07070f' }}>{children}</body>
    </html>
  )
}

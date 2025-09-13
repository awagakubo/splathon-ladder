export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-6">
      <h1 className="text-3xl font-bold">トーナメント管理</h1>
      <a href="/teams" className="rounded bg-black px-4 py-2 text-white">チーム一覧へ</a>
    </main>
  )
}

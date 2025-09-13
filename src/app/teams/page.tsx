"use client"
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { Team } from '@/types'

type TeamInput = {
  name: string
  members: [string, string, string, string]
  rating: number
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adminToken, setAdminToken] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [newTeam, setNewTeam] = useState<TeamInput>({ name: '', members: ['', '', '', ''], rating: 1500 })

  useEffect(() => {
    const t = localStorage.getItem('adminToken')
    if (t) setAdminToken(t)
  }, [])

  const reload = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/teams', { cache: 'no-store' })
      const json = await res.json()
      setTeams(json.teams || [])
      setError(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  const handleSaveAdminToken = () => {
    localStorage.setItem('adminToken', adminToken)
    alert('管理者トークンを保存しました')
  }

  const isAdmin = useMemo(() => !!adminToken, [adminToken])

  const handleCreate = async () => {
    if (!isAdmin) {
      alert('管理者トークンが必要です')
      return
    }
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({
          name: newTeam.name,
          members: newTeam.members,
          rating: newTeam.rating,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || '作成に失敗しました')
      }
      setShowNew(false)
      setNewTeam({ name: '', members: ['', '', '', ''], rating: 1500 })
      reload()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'エラーが発生しました')
    }
  }

  const handleUpdateRating = async (team: Team) => {
    const value = prompt(`新しいレートを入力: ${team.name}`, `${team.rating}`)
    if (value == null) return
    const rating = Number(value)
    if (!Number.isFinite(rating)) {
      alert('数値を入力してください')
      return
    }
    try {
      const res = await fetch(`/api/teams/${team.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({ rating }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || '更新に失敗しました')
      }
      reload()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'エラーが発生しました')
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-4 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">チームランキング</h1>
        <Link className="text-sm text-blue-600 underline" href="/">トップへ</Link>
      </header>

      <section className="rounded border p-3 space-y-2">
        <h2 className="font-semibold">管理者</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="password"
            placeholder="管理者トークン"
            value={adminToken}
            onChange={(e) => setAdminToken(e.target.value)}
            className="w-full sm:w-80 rounded border px-3 py-2"
          />
          <button onClick={handleSaveAdminToken} className="rounded bg-black px-3 py-2 text-white">保存</button>
          <button onClick={() => setShowNew(true)} className="rounded border px-3 py-2">新規チーム</button>
        </div>
      </section>

      {showNew && (
        <section className="rounded border p-4 space-y-3">
          <h2 className="font-semibold">新規チーム登録</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm text-gray-600">チーム名</span>
              <input className="w-full rounded border px-3 py-2" value={newTeam.name} onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })} />
            </label>
            <label className="space-y-1">
              <span className="text-sm text-gray-600">初期レート</span>
              <input type="number" className="w-full rounded border px-3 py-2" value={newTeam.rating} onChange={(e) => setNewTeam({ ...newTeam, rating: Number(e.target.value) })} />
            </label>
            {newTeam.members.map((m, idx) => (
              <label key={idx} className="space-y-1">
                <span className="text-sm text-gray-600">メンバー{idx + 1}</span>
                <input className="w-full rounded border px-3 py-2" value={m} onChange={(e) => {
                  const arr = [...newTeam.members] as TeamInput['members']
                  arr[idx] = e.target.value
                  setNewTeam({ ...newTeam, members: arr })
                }} />
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="rounded bg-blue-600 px-4 py-2 text-white">登録</button>
            <button onClick={() => setShowNew(false)} className="rounded border px-4 py-2">キャンセル</button>
          </div>
        </section>
      )}

      <section className="rounded border">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <h2 className="font-semibold">チーム一覧</h2>
          <button onClick={reload} className="text-sm text-blue-600">再読み込み</button>
        </div>
        {loading ? (
          <div className="p-4 text-gray-500">読み込み中…</div>
        ) : error ? (
          <div className="p-4 text-red-600">{error}</div>
        ) : (
          <div className="divide-y">
            {teams.map((t, i) => (
              <div key={t.id} className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-12 sm:items-center">
                <div className="text-sm text-gray-500 sm:col-span-1">{i + 1}位</div>
                <div className="font-medium sm:col-span-3">{t.name}</div>
                <div className="text-sm text-gray-700 sm:col-span-5 flex flex-wrap gap-x-3 gap-y-1">
                  {t.members?.map((m, idx) => (
                    <span key={idx}>{m}</span>
                  ))}
                </div>
                <div className="sm:col-span-2 font-mono">{t.rating}</div>
                <div className="sm:col-span-1">
                  <button
                    className="w-full rounded border px-2 py-1 text-sm disabled:opacity-50"
                    disabled={!isAdmin}
                    onClick={() => handleUpdateRating(t)}
                  >レート更新</button>
                </div>
              </div>
            ))}
            {teams.length === 0 && (
              <div className="p-4 text-gray-500">まだチームがありません</div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

export type Team = {
  id: string
  event_id: string | null
  name: string
  members: string[] // length 4
  rating: number
  created_at: string
}

export type RatingHistory = {
  id: string
  team_id: string
  round: number
  rating: number
  note: string | null
  created_at: string
}


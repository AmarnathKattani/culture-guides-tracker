/**
 * Activities goal per quarter for the "Your Impact" progress ring
 * Override via ACTIVITIES_GOAL_PER_QUARTER env var
 */
export const ACTIVITIES_GOAL_PER_QUARTER =
  parseInt(process.env.ACTIVITIES_GOAL_PER_QUARTER || "20", 10) || 20

/**
 * Tier thresholds for points (used for "points to next tier" messaging)
 */
export const TIER_THRESHOLDS = [
  { name: "Bronze", minPoints: 0 },
  { name: "Silver", minPoints: 100 },
  { name: "Gold", minPoints: 250 },
  { name: "Platinum", minPoints: 500 },
] as const

export type TierName = (typeof TIER_THRESHOLDS)[number]["name"]

/**
 * Get current tier and next tier info for a given points total
 */
export function getTierInfo(points: number): {
  tier: TierName
  nextTier: TierName | null
  pointsToNextTier: number
} {
  let tier: TierName = "Bronze"
  let nextTier: TierName | null = "Silver"
  let pointsToNextTier = 100

  for (let i = TIER_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= TIER_THRESHOLDS[i].minPoints) {
      tier = TIER_THRESHOLDS[i].name
      if (i < TIER_THRESHOLDS.length - 1) {
        nextTier = TIER_THRESHOLDS[i + 1].name
        pointsToNextTier = TIER_THRESHOLDS[i + 1].minPoints - points
      } else {
        nextTier = null
        pointsToNextTier = 0
      }
      break
    }
  }

  return { tier, nextTier, pointsToNextTier }
}

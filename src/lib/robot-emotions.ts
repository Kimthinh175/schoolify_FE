/**
 * Danh sách ID biểu cảm hợp lệ của Robot Schoolify.
 * Dùng chung cho FE (widget) và API route để validate trường `emotion` BE trả về.
 * Giữ đồng bộ với type `RobotEmotion` trong SchoolifyRobot.tsx.
 */
export const ROBOT_EMOTION_IDS = [
  'default',
  'happy',
  'excited',
  'wink',
  'thinking',
  'idea',
  'love',
  'celebrate',
  'sad',
  'angry',
  'sleeping',
  'surprised',
  'stunned',
] as const;

export type RobotEmotionId = (typeof ROBOT_EMOTION_IDS)[number];

export function isRobotEmotion(value: unknown): value is RobotEmotionId {
  return typeof value === 'string' && (ROBOT_EMOTION_IDS as readonly string[]).includes(value);
}

/** Thời gian giữ biểu cảm hợp lệ (ms): 1s – 15s, mặc định 4s */
export function clampEmotionDuration(value: unknown, fallback = 4000): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(15000, Math.max(1000, Math.round(n)));
}

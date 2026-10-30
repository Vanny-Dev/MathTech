export const activitySnapshot = (activity) => ({
  question: activity.question,
  type: activity.type,
  choices: [...(activity.choices || [])],
  correctAnswer: activity.correctAnswer,
  explanation: activity.explanation,
  points: activity.points,
  comic: activity.comic?.toObject?.() ?? activity.comic,
});

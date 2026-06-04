import { Request, Response } from 'express';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: string;
}

const achievements: Achievement[] = [
  {
    id: 'first_match',
    name: 'First Match',
    description: 'Make your first match',
    icon: '🎮',
  },
  {
    id: 'ten_matches',
    name: 'Match Master',
    description: 'Complete 10 matches',
    icon: '⭐',
  },
  {
    id: 'score_1000',
    name: 'Score Beast',
    description: 'Reach 1000 points',
    icon: '🏆',
  },
];

const userAchievements: UserAchievement[] = [];

export const getAchievements = (req: Request, res: Response) => {
  res.json(achievements);
};

export const getUserAchievements = (req: Request, res: Response) => {
  const { userId } = req.params;

  const userAchievs = userAchievements
    .filter((ua) => ua.userId === userId)
    .map((ua) => {
      const achievement = achievements.find((a) => a.id === ua.achievementId);
      return {
        ...achievement,
        unlockedAt: ua.unlockedAt,
      };
    });

  res.json(userAchievs);
};

export const unlockAchievement = (req: Request, res: Response) => {
  const { userId, achievementId } = req.body;

  if (!userId || !achievementId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const achievement = achievements.find((a) => a.id === achievementId);
  if (!achievement) {
    return res.status(404).json({ error: 'Achievement not found' });
  }

  const existing = userAchievements.find(
    (ua) => ua.userId === userId && ua.achievementId === achievementId
  );

  if (existing) {
    return res.status(400).json({ error: 'Achievement already unlocked' });
  }

  const newUserAchievement: UserAchievement = {
    userId,
    achievementId,
    unlockedAt: new Date().toISOString(),
  };

  userAchievements.push(newUserAchievement);

  res.json({ success: true, achievement: newUserAchievement });
};

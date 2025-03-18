const BASE_URL = "http://localhost:5050";
const URL_PART = "/api/v1";

export const ApiEndPoints = {
    login : `${BASE_URL}/login`,
    signup : `${BASE_URL}${URL_PART}/user/signup`,
    refresh : `${BASE_URL}/refresh`,
    getAllQuests : `${BASE_URL}${URL_PART}/quest/get`,
    createQuest : `${BASE_URL}${URL_PART}/quest/create`,
    createChallenge : `${BASE_URL}${URL_PART}/challenge/create`,
    toggleQuestActiveStatus : `${BASE_URL}${URL_PART}/quest/toggle/`,
    getChallenge : `${BASE_URL}${URL_PART}/challenges`,
    getActiveQuests : `${BASE_URL}${URL_PART}/quest/active`,
    enrollChallenge : `${BASE_URL}${URL_PART}/challenge/enroll/`,
    getQuestDetails : `${BASE_URL}${URL_PART}/challenge/questDetails`,
    getUserChallengeDetails : `${BASE_URL}${URL_PART}/challenge/user/details`,
    getVideoStats : `${BASE_URL}${URL_PART}/video/stats`,
    getUserVideoStatus : `${BASE_URL}${URL_PART}/video/status`,
    getChallengeProgress : `${BASE_URL}${URL_PART}/video/progress/`,
    toggleVideoLike : `${BASE_URL}${URL_PART}/video/like`,
    videoShare : `${BASE_URL}${URL_PART}/video/share`,
    getQuestLeaderboard : `${BASE_URL}${URL_PART}/quest/leaderboard/`,
    getQuestParticipantsDetails : `${BASE_URL}${URL_PART}/challenge/participants`,
    getUserRewards : `${BASE_URL}${URL_PART}/user/rewards`,
    claimReward : `${BASE_URL}${URL_PART}/user/reward/claim/`,
    updateQuest : `${BASE_URL}${URL_PART}/quest/`,
    completeQuest : `${BASE_URL}${URL_PART}/user/quest/complete/`
}
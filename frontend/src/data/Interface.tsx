// Userstate Interface
export interface UserState {
    id: string,
    username: string,
    isAdmin: boolean,
    firstname?: string,
    lastname?: string,
    wallet?: number
}

export interface AuthState {
    username: string,
    password: string,
    firstname?: string,
    lastname?: string
}

export interface QuestState {
    Title: string,
    Description: string
    start_date: Date,
    end_date: Date,
    total_budget: number,
    total_participates? : number,
    quest_image: Uint8Array,
    is_Active? : string,
    id? :string,
    image_url? : string
}

export interface ChallengeQuest {
    like_video_count : number,
    share_video_count : number,
    fk_quest_id? : string,
    Title : string
}

export interface ChallengeRewardQuest{
    fk_challenge_id? : number,
    reward_type : string,
    points? : number,
    active_duration_days : number
}
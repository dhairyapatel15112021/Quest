import { useEffect } from "react";
import { Edit } from "../../components/icons/Edit";
import { Plus } from "../../components/icons/Plus";
import { Link, useParams } from "react-router-dom";
import { Loader } from "../../components/Loader";
import { Heart } from "../../components/icons/Heart";
import { Share } from "../../components/icons/Share";
import { Trophy } from "../../components/icons/Trophy";
import { Coffee } from "../../components/icons/Coffee";
import { Coupon } from "../../components/icons/Coupon";
import { Delete } from "../../components/icons/Delete";
import { useFetchChallengesQuery } from "../../query/api/admin/challenge";
import { toast } from "react-toastify";

export const Overview = () => {
  const { id } = useParams<{ id: string }>();
  const {
    data: challengesData,
    isLoading,
    isError,
  } = useFetchChallengesQuery(id || "");
  const challenges = challengesData?.data?.data?.challenges ?? [];
  const stats =
    challengesData?.data?.data?.questStats &&
    !Array.isArray(challengesData.data.data.questStats)
      ? challengesData.data.data.questStats
      : {
          totalChallenges: 0,
          totalParticipants: 0,
          fullyCompletedUsers: 0,
          fullyCompletedPercentage: 0,
          halfCompletedUsers: 0,
          halfCompletedPercentage: 0,
        };

  useEffect(() => {
    if (isError) {
      toast.error("Failed to fetch challenges. Please try again later.");
    }
  }, [isError]);

  return (
    <div className="w-full px-28 py-[3vh] flex flex-col h-full">
      <div className="flex justify-between items-center">
        <div className="text-black font-semibold">User Engagement Metrics</div>
        <div className="flex justify-center items-center gap-2">
          <Link
            to="/admin/quest/challange"
            className="flex text-sm justify-center items-center gap-1 bg-blue-500 text-white p-2 rounded-4xl"
          >
            <div>
              <Plus />
            </div>
            <div>New Challenges</div>
          </Link>
          <div className="flex text-sm justify-center items-center gap-1 bg-orange-400 text-white p-2 rounded-4xl">
            <div>
              <Edit />
            </div>
            <div>Edit Challenges</div>
          </div>
        </div>
      </div>

      <div className="flex mt-[2vh] w-full text-gray-600 justify-between items-center gap-2">
        <div className="p-3 w-[48%] rounded-xl bg-orange-100 flex gap-3 items-center">
          <div className="font-bold text-lg">
            {stats?.fullyCompletedUsers || 0}
          </div>
          <div>
            <div className="font-medium text-base">User</div>
            <div className="font-light text-base">Completed Quest</div>
          </div>
        </div>
        <div className="p-3 w-[48%] rounded-xl bg-orange-100 flex gap-3 items-center">
          <div className="font-bold text-lg">
            {stats?.halfCompletedUsers || 0}
          </div>
          <div>
            <div className="font-medium text-base">User</div>
            <div className="font-light text-base">Completed 50% Quest</div>
          </div>
        </div>
      </div>

      <div className="flex-1 mt-6 rounded-xl p-6 shadow-sm min-h-0">
        <div className="text-base font-medium mb-4 text-gray-600">
          Challenges
        </div>
        <div className="h-[calc(100%-2rem)] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader />
            </div>
          ) : challenges.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <Trophy />
              <div>No challenges available</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 pr-2">
              {challenges.map((challenge) => (
                <div
                  key={challenge._id}
                  className="grid grid-rows-1 grid-cols-9 rounded-xl p-4 place-items-center justify-items-start hover:shadow-xs transition-shadow bg-[#efede5]"
                >
                  <div className="col-span-3 text-xs md:text-sm font-medium text-black">
                    {challenge.Title || "No Title"}
                  </div>
                  <div className="col-span-3 flex gap-4 mb-3">
                    <div className="flex items-center gap-2 text-rose-500 font-light">
                      <Heart className="w-5 h-5" />
                      <span>{challenge.like_video_count || 0} likes</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-500 font-light">
                      <Share className="w-5 h-5" />
                      <span>{challenge.share_video_count || 0} shares</span>
                    </div>
                  </div>

                  <div className="col-span-3 flex flex-wrap gap-2">
                    {challenge.rewards.map((reward, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                          reward.reward_type === "free coffee"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {reward.reward_type === "free coffee" ? (
                          <>
                            <Coffee className="w-4 h-4" />
                            <span>Free Coffee</span>
                          </>
                        ) : (
                          <>
                            <Coupon className="w-4 h-4" />
                            <span>{reward.points} Points</span>
                          </>
                        )}
                        <span className="text-xs">
                          ({reward.active_duration_days}d)
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center text-sm gap-2 text-red-500 cursor-pointer rounded-full px-3 py-1 bg-red-100">
                      <div>
                        <Delete />
                      </div>
                      <div>Delete</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

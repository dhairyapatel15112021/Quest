import { useEffect, useState } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import { Left } from "../../components/icons/Left";
import { Loader } from "../../components/Loader";
import { Flag } from "../../components/icons/Flag";
import axios, { AxiosResponse } from "axios";
import { AxiosRequestConfig } from "axios";
import { ApiEndPoints } from "../../query/api/ApiEndPoints";
import { toast } from "react-toastify";
import { MdOutlineLeaderboard } from "react-icons/md";
import {
  setQuestData,
  useCompleteQuestMutation,
  useFetchQuestQuery,
} from "../../query/api/user/quests";

export const UserQuestBanner = () => {
  const { id } = useParams();
  // const [isLoading, setIsLoading] = useState(true);
  const {
    data: quest,
    isLoading,
    isError,
    error,
  } = useFetchQuestQuery(id || "");
  const { isPending, mutate: completeQuestMutate } = useCompleteQuestMutation();

  const completeQuest = () => {
    if (isPending || !id) return;
    if (quest?.data.isCompleted) {
      toast.info("Quest already marked as completed");
      return;
    }
    completeQuestMutate(id, {
      onSuccess(data) {
        toast.success(data.message);
        setQuestData(id);
      },
      onError(error) {
        toast.error(error.message);
      },
    });
  };

  if (isError) {
    toast.error(error.message || "Failed to fetch Quest Information!");
  }

  if (!isLoading && !quest?.data) return;

  return (
    <>
      {isLoading ? (
        <div className="h-[30vh] bg-gray-700 text-white rounded-2xl px-28">
          <Loader />
        </div>
      ) : (
        <div className="h-[30vh] w-full min-h-fit bg-gray-700 text-white rounded-2xl px-28 flex flex-col justify-between">
          <div className="p-2 flex justify-between items-center justify-self-start">
            <Link
              to="/user/dashboard/quests"
              className="bg-gray-500 text-white p-2 rounded-full"
            >
              <Left />
            </Link>
          </div>

          <div className="p-2 flex justify-between items-center">
            <div className="flex flex-col items-start gap-3">
              <div className="font-medium text-3xl">
                {quest?.data.questTitle}
              </div>
              <div className="flex flex-col items-center bg-gray-500 gap-1 p-3 rounded-lg">
                <div className="grid grid-rows-1 grid-cols-2 gap-3 w-fit h-fit">
                  <div className="flex flex-col items-center gap-1 px-4 border-r-[1px] border-gray-400/50">
                    <div className="flex gap-1 items-center justify-center">
                      <div>{quest?.data.progress.completedChallenges}</div>
                      <Flag className="size-4" />
                    </div>
                    <div className="text-sm font-light">Completed</div>
                  </div>
                  <div className="flex flex-col items-center gap-1 px-4">
                    <div>
                      {quest?.data.daysLeft ? quest?.data.daysLeft : "∞"}
                    </div>
                    <div className="text-sm font-light">Days Left</div>
                  </div>
                </div>
                <div className="w-full h-fit">
                  <progress
                    className={`progress after:bg-green-400 progress-success w-full`}
                    value={
                      ((quest?.data.progress.completedChallenges || 0) * 100) /
                      (quest?.data.progress.totalChallenges || 1)
                    }
                    max="100"
                  ></progress>
                </div>
              </div>
            </div>
            <img
              src={`data:image/jpeg;base64,${quest?.data.questImage}`}
              alt="photo.png"
              className="rounded-2xl h-[100px]"
            />
          </div>
          <div className="flex justify-start items-center gap-4 px-5 w-full">
            <NavLink
              to={`/user/quest/${id}/progress`}
              className={({ isActive }) =>
                `${
                  isActive ? "border-b-[3px] border-orange-300" : "border-none"
                } text-base py-3 flex items-center gap-2 w-fit h-fit`
              }
            >
              <div className="text-sm font-light">
                <Flag className="size-4" />
              </div>
              <div className="text-sm font-light">My Progress</div>
            </NavLink>
            <NavLink
              to={`/user/quest/${id}/leaderboard`}
              className={({ isActive }) =>
                `${
                  isActive ? "border-b-[3px] border-orange-300" : "border-none"
                } text-base py-3 flex items-center gap-3 w-fit h-fit`
              }
            >
              <div className="text-base font-light">
                <MdOutlineLeaderboard />
              </div>
              <div className="text-sm font-light">Leaderboard</div>
            </NavLink>
            <button
              disabled={quest?.data.isCompleted}
              onClick={() => completeQuest()}
              className={`flex items-center gap-2 text-sm font-light ml-auto px-3 py-2 rounded-4xl transition-all duration-200 ${
                quest?.data.isCompleted
                  ? "bg-green-400/20 text-green-200 cursor-not-allowed"
                  : "bg-gray-500/50 text-white hover:bg-orange-300/20 hover:text-orange-300 cursor-pointer"
              }`}
            >
              <div>
                {quest?.data.isCompleted ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                )}
              </div>
              <div>
                {quest?.data.isCompleted ? "Completed" : "Mark as Completed"}
              </div>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

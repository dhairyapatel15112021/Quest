import { toast } from "react-toastify";
import { Loader } from "../../components/Loader";
import { Link } from "react-router-dom";
import {
  EnrollQuestResponse,
  updateQuestData,
  useFetchActiveQuestQuery,
  useQuestEnrollMutationQuery,
} from "../../query/api/user/quests";

export const Quests = () => {
  const { data: activeQuests, isLoading } = useFetchActiveQuestQuery();
  const { mutate: enrollQuestMutate, isPending } =
    useQuestEnrollMutationQuery();

  const enrollQuest = (questId: string) => {
    if (isPending) return;
    enrollQuestMutate(questId, {
      onSuccess: (response: EnrollQuestResponse) => {
        updateQuestData(questId);
        toast.success(response.message);
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    });
  };

  if (!activeQuests?.data) return;

  return (
    <>
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Loader />
        </div>
      ) : activeQuests?.data.length > 0 ? (
        <div className="py-5 w-full min-w-fit h-full grid grid-cols-2 gap-y-5 justify-items-center overflow-y-scroll">
          {activeQuests.data.map((quest) => (
            <div
              key={quest._id}
              className="relative w-4/5 bg-white h-fit rounded-lg flex flex-col items-center justify-center"
            >
              <img
                src={`data:image/jpeg;base64,${quest.quest_image}`}
                alt={quest.Title}
                className="w-full h-[130px] object-cover rounded-tr-2xl rounded-tl-2xl"
              />
              <img
                src={`data:image/jpeg;base64,${quest.quest_image}`}
                alt={quest.Title}
                className="absolute top-[50%] left-0 w-full h-[130px] object-cover rounded-br-2xl rounded-bl-2xl"
              />
              <div className="w-full flex flex-col gap-1 bg-[#36454f]/80 backdrop-blur-sm backdrop-saturate-50 border border-white/10 shadow-sm shadow-black/40 justify-center p-3 rounded-br-2xl rounded-bl-2xl">
                <div className="text-base text-white/90 font-medium">
                  {quest.Title}
                </div>
                <div className="text-sm text-gray-400/90 text-wrap md:text-nowrap font-light">
                  {quest.start_date.toString().split("T")[0]} -{" "}
                  {quest.end_date
                    ? quest.end_date.toString().split("T")[0]
                    : "♾️"}
                </div>
                <div className="text-sm text-gray-300/90 text-nowrap font-normal">
                  {quest.totalParticipants} Participants
                </div>
                <div className="p-1 my-2 text-xs font-extralight rounded-md text-gray-200/90 border border-gray-400/30 backdrop-blur-sm w-fit hover:border-gray-400/50 transition-colors">
                  {quest.userQuestStatus ? (
                    <Link
                      to={`/user/quest/${quest._id}/progress`}
                      className="cursor-pointer"
                    >
                      {quest.userQuestStatus}
                    </Link>
                  ) : (
                    <div
                      className="cursor-pointer"
                      onClick={() => enrollQuest(quest._id)}
                    >
                      {isPending ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Loader />
                        </div>
                      ) : (
                        "Join"
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
          <div className="text-6xl">😔</div>
          <div className="text-xl text-gray-600">
            No Active Quests available.
          </div>
        </div>
      )}
    </>
  );
};

import { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Left } from "../../components/icons/Left";
import { Loader } from "../../components/Loader";
import { Up } from "../../components/icons/Up";
import { Down } from "../../components/icons/Down";
import { Heart } from "../../components/icons/Heart";
import { Share } from "../../components/icons/Share";
import { videos } from "../../data/VideoFeedData";
import { useRecoilState } from "recoil";
import { videoIndexAtom } from "../../store/atoms/videoIndexAtom";
import { toast } from "react-toastify";
import { useKeyboard } from "../../hooks/useKeyboard";
import { MdKeyboardArrowRight } from "react-icons/md";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { MdKeyboardArrowUp } from "react-icons/md";
import { MdKeyboardArrowDown } from "react-icons/md";
import { SiStarbucks } from "react-icons/si";
import {
  updateStatsData,
  updateStatusData,
  updateUserProgressData,
  useFetchStatsQuery,
  useFetchStatusQuery,
  useFetchUserProgressQuery,
} from "../../query/api/user/video/stats";
import {
  useToggleVideoLikeMutation,
  useToggleVideoShareMutation,
} from "../../query/api/user/video/actions";

export const VideoFeed = () => {
  const { challengeId, id } = useParams();
  const [videoIndex, setVideoIndex] = useRecoilState(videoIndexAtom);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const {
    isLoading: isStatsLoading,
    data: videoStats,
    isError: isStatsError,
  } = useFetchStatsQuery(videos[videoIndex]?.filename, videoIndex);
  const {
    isLoading: isStatusLoading,
    data: videoStatus,
    isError: isStatusError,
  } = useFetchStatusQuery(
    videos[videoIndex]?.filename,
    challengeId,
    videoIndex
  );
  // TODO : in the below api hit, we have to add dependency of the index also.
  const {
    isLoading: isProgressLoading,
    isError: isProgressError,
    data: userProgressData,
  } = useFetchUserProgressQuery(challengeId);
  const { isPending: isShareLoading, mutate: videoShareMutate } =
    useToggleVideoShareMutation();
  const { isPending: isLikeLoading, mutate: videoLikeMutate } =
    useToggleVideoLikeMutation();
  const isLoading: boolean =
    isStatsLoading ||
    isStatusLoading ||
    isShareLoading ||
    isShareLoading ||
    isLikeLoading ||
    isProgressLoading ||
    isVideoLoading;

  const toggleVideoShare = () => {
    if (videoStatus?.is_shared) {
      toast.info("Video already shared");
      return;
    }
    videoShareMutate(
      {
        fileName: videos[videoIndex]?.filename,
        challengeId: challengeId,
      },
      {
        onSuccess(data) {
          if (!data.success) {
            return;
          }
          toast.success(data.message);
          if (data.isChallengeComplete) {
            toast.success(data.challengeMessage);
          }
          updateStatsData(true, videos[videoIndex]?.filename, videoIndex);
          updateStatusData(
            true,
            videos[videoIndex]?.filename,
            videoIndex,
            challengeId
          );
          updateUserProgressData(challengeId, true);
          navigator.clipboard.writeText(
            `http://localhost:5173/src/assets/videos/${videos[videoIndex]?.filename}` ||
              ""
          );
          toast.success("Video copied to clipboard!");
        },
        onError(error) {
          toast.error(`Error toggling video share ${error.message}`);
        },
      }
    );
  };

  const toggleVideoLike = () => {
    videoLikeMutate(
      {
        fileName: videos[videoIndex]?.filename,
        challengeId: challengeId,
      },
      {
        onSuccess(data) {
          if (!data.success) {
            return;
          }
          toast.success(data.message);
          if (data.isChallengeComplete) {
            toast.success(data.challengeMessage);
          }
          updateStatusData(
            false,
            videos[videoIndex].filename,
            videoIndex,
            challengeId
          );
          updateStatsData(false, videos[videoIndex].filename, videoIndex);
          updateUserProgressData(challengeId, false);
        },
        onError(error) {
          toast.error(`Error toggling video like ${error.message}`);
        },
      }
    );
  };

  const handlePrevVideo = () => {
    if (videoRef.current) {
      setIsVideoLoading(true);
      videoRef.current.pause();
      setVideoIndex((prev) => (prev - 1 + videos.length) % videos.length);
      videoRef.current.play();
    }
    setIsVideoLoading(false);
  };

  const handleNextVideo = () => {
    if (videoRef.current) {
      setIsVideoLoading(true);
      videoRef.current.pause();
      setVideoIndex((prev) => (prev + 1) % videos.length);
      videoRef.current.play();
    }
    setIsVideoLoading(false);
  };

  const handleVideoLoad = () => {
    setIsVideoLoading(false);
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Error playing video:", error);
        setIsVideoLoading(false);
      });
    }
  };

  const handleVideoError = () => {
    setIsVideoLoading(false);
  };

  // Use the keyboard hook
  useKeyboard({
    onArrowUp: handlePrevVideo,
    onArrowDown: handleNextVideo,
    onArrowRight: toggleVideoLike,
    onArrowLeft: toggleVideoShare,
    dependencies: [videoIndex, videoStatus?.is_liked, videoStatus?.is_shared],
  });

  if (isStatsError) {
    toast.error("Error fetching video stats");
  }

  if (isStatusError) {
    toast.error("Error fetching user video status");
  }

  if (isProgressError) {
    toast.error("Error fetching user challenge progress");
  }

  return (
    <>
      {isLoading ? (
        <div className="h-[90vh] flex justify-center items-center">
          <Loader />
        </div>
      ) : (
        <div className="h-[90vh] text-black px-2 md:px-10 py-2 grid grid-rows-1 grid-cols-3 justify-items-start place-items-start">
          <Link
            to={`/user/quest/${id}/progress`}
            className="text-xs md:text-base flex justify-center items-center gap-1"
          >
            <Left />
            <div>Cancel</div>
          </Link>
          <div className="flex flex-col gap-2 justify-between items-center w-full h-full">
            <div className="font-medium text-base md:text-lg self-start ml-[33%]">
              Video Feed
            </div>
            <div className="rounded-lg p-2 w-full h-full flex gap-2">
              <div className="w-[90%] h-[95%] bg-gray-100 rounded-lg">
                {videos[videoIndex] && (
                  <video
                    ref={videoRef}
                    src={videos[videoIndex].video}
                    controls
                    playsInline
                    className="w-full h-full object-cover rounded-lg transition-all duration-300"
                    onLoadedData={handleVideoLoad}
                    onError={handleVideoError}
                  />
                )}
              </div>
              <div className="w-[10%] h-[95%] flex flex-col gap-3 justify-end">
                <div
                  className="rounded-full bg-gray-300 p-2 text-black h-fit w-fit cursor-pointer hover:bg-gray-400"
                  onClick={handlePrevVideo}
                >
                  <Up />
                </div>
                <div
                  className="rounded-full bg-gray-300 p-2 text-black h-fit w-fit cursor-pointer hover:bg-gray-400"
                  onClick={handleNextVideo}
                >
                  <Down />
                </div>
                <div className="flex flex-col items-center gap-2 mt-10">
                  <div
                    className="rounded-full bg-gray-300 p-2 text-black h-fit w-fit cursor-pointer hover:bg-gray-400"
                    onClick={toggleVideoLike}
                  >
                    <Heart
                      className={`size-5 text-red-500 ${
                        videoStatus?.is_liked ?? false
                          ? "fill-red-500"
                          : "fill-gray-300"
                      }`}
                    />
                  </div>
                  <div>{videoStats?.totalLikes ?? 0}</div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="rounded-full p-2 bg-gray-300 text-black h-fit w-fit cursor-pointer hover:bg-gray-400"
                    onClick={toggleVideoShare}
                  >
                    <Share
                      className={`size-5 text-green-500 ${
                        videoStatus?.is_shared ?? 0
                          ? "fill-green-100"
                          : "fill-gray-300"
                      }`}
                    />
                  </div>
                  <div>{videoStats?.totalShares ?? 0}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 justify-self-center mt-10">
            <div className="text-base font-normal">Challenge Objectives</div>
            {userProgressData ? (
              <div className="grid grid-rows-2 gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-gray-600 flex items-center gap-2">
                    <div className="text-red-500">Like</div>
                    <div>
                      <Heart className="size-5 text-red-500" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-lg">
                    <div className="text-black font-semibold text-lg">
                      {userProgressData.data.progress.likedVideos || 0}
                    </div>
                    <div>/</div>
                    <div className="text-gray-600 font-light text-base">
                      {userProgressData.data.requirements.like_video_count || 0}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-gray-600 flex items-center gap-2">
                    <div className="text-green-500">Share</div>
                    <div>
                      <Share className="size-5 text-green-500" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-lg">
                    <div className="text-black font-semibold text-lg">
                      {userProgressData.data.progress.sharedVideos || 0}
                    </div>
                    <div>/</div>
                    <div className="text-gray-600 font-light text-base">
                      {userProgressData.data.requirements.share_video_count ||
                        0}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
                <div>Loading objectives...</div>
                <Loader />
              </div>
            )}
          </div>
          <div className="absolute bottom-5 right-5 flex flex-col gap-2 items-end justify-center">
            <div>
              <label
                htmlFor="my_modal_7"
                className="flex items-center gap-2 text-gray-600 bg-gray-200 backdrop-blur-sm px-4 py-2 rounded-lg cursor-pointer hover:bg-white/20 transition-all duration-200 border border-white/20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 3a1 1 0 012 0v5.5a.5.5 0 001 0V4a1 1 0 112 0v4.5a.5.5 0 001 0V6a1 1 0 112 0v5a7 7 0 11-14 0V9a1 1 0 012 0v2.5a.5.5 0 001 0V4a1 1 0 012 0v4.5a.5.5 0 001 0V3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-normal">Keyboard Shortcuts</span>
              </label>
              <input type="checkbox" id="my_modal_7" className="modal-toggle" />
              <div className="modal" role="dialog">
                <div className="modal-box bg-white/10 backdrop-blur-lg border border-white/20">
                  <div className="flex items-center gap-2 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-blue-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 3a1 1 0 012 0v5.5a.5.5 0 001 0V4a1 1 0 112 0v4.5a.5.5 0 001 0V6a1 1 0 112 0v5a7 7 0 11-14 0V9a1 1 0 012 0v2.5a.5.5 0 001 0V4a1 1 0 012 0v4.5a.5.5 0 001 0V3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <h3 className="text-lg font-bold text-white">
                      Keyboard Shortcuts
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <span className="text-white/80">Like / Unlike Video</span>
                      <kbd className="px-2 py-1 text-lg font-semibold text-white/80 bg-white/10 rounded">
                        <MdKeyboardArrowRight />
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <span className="text-white/80">Share Video</span>
                      <kbd className="px-2 py-1 text-lg font-semibold text-white/80 bg-white/10 rounded">
                        <MdKeyboardArrowLeft />
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <span className="text-white/80">Next Video</span>
                      <kbd className="px-2 py-1 text-lg font-semibold text-white/80 bg-white/10 rounded">
                        <MdKeyboardArrowDown />
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <span className="text-white/80">Previous Video</span>
                      <kbd className="px-2 py-1 text-lg font-semibold text-white/80 bg-white/10 rounded">
                        <MdKeyboardArrowUp />
                      </kbd>
                    </div>
                  </div>
                  <div className="modal-action">
                    <label
                      htmlFor="my_modal_7"
                      className="btn bg-white/10 hover:bg-white/20 text-white border-white/20"
                    >
                      Close
                    </label>
                  </div>
                </div>
                <label className="modal-backdrop" htmlFor="my_modal_7">
                  Close
                </label>
              </div>
            </div>
            <Link
              to={`https://starbucks.begenuin.com/community/creative-coffee-creations`}
              target="_blank"
              className="flex items-center justify-center gap-2 text-gray-600 px-4 py-2 rounded-lg bg-gray-200 backdrop-blur-sm border cursor-pointer hover:bg-white/20 transition-all duration-200 border-white/20"
            >
              <SiStarbucks className="size-5 text-gray-600" />
              <div className="text-sm font-normal">
                Join Starbucks Community
              </div>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

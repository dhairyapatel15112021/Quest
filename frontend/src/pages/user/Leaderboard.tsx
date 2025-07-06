import axios, { AxiosRequestConfig } from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApiEndPoints } from '../../query/api/ApiEndPoints';
import { Loader } from '../../components/Loader';

interface LeaderboardResponse {
    success: boolean;
    message: string;
    data: {
        totalEnrolledUsers: number;
        leaderboard: Array<{
            _id: string;
            firstname: string;
            lastname: string;
            rewards: {
                points: number,
                freeCoffee: number,
                coupons: {
                    description: string
                }
            }
        }>;
    };
}

export const Leaderboard = () => {
    const { id } = useParams();
    const [leaderboard, setLeaderboard] = useState<LeaderboardResponse["data"]["leaderboard"]>([]);
    const [loading, setLoading] = useState(false);
    const [totalEnrolledUsers, setTotalEnrolledUsers] = useState(0);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const abortController = new AbortController();
            const axiosConfig: AxiosRequestConfig = {
                url: `${ApiEndPoints.getQuestLeaderboard}?questId=${id}`,
                method: "GET",
                headers: {
                    Authorization: localStorage.getItem("token") || ""
                },
                signal: abortController.signal
            };
            const response = await axios(axiosConfig);
            setLeaderboard(response.data.data.leaderboard);
            setTotalEnrolledUsers(response.data.data.totalEnrolledUsers);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, [id]);

    // Function to get initials from name
    const getInitials = (firstname: string, lastname: string) => {
        return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
    };

    // Function to get rank badge color
    const getRankBadgeStyle = (index: number) => {
        switch (index) {
            case 0:
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 1:
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 2:
                return 'bg-orange-50 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    return (
        <div className="flex-1 mt-4 rounded-xl p-6 mx-30 shadow-lg min-h-0">
            {/* Header Section */}
            <div className="text-base font-medium mb-4 text-gray-600">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-medium text-gray-900">Quest Leaderboard</h1>
                        <p className="text-gray-600 font-light text-sm">Track your progress and compete with others!</p>
                    </div>

                    {/* Stats Card */}
                    <div className="rounded-xl shadow-sm p-2 border border-gray-100">
                        <div className="flex items-center space-x-4">
                            <div className="p-2.5 bg-amber-50 rounded-lg">
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Participants</p>
                                <p className="text-xl font-bold text-gray-900">{totalEnrolledUsers}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-fit">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 pr-2 overflow-y-scroll max-h-[calc(100vh-280px)]">
                        {leaderboard.map((user, index) => (
                            <div key={user._id} className="p-3 bg-[#efede5] hover:bg-gray-50 transition-colors rounded-lg border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        {/* Rank */}
                                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg border ${getRankBadgeStyle(index)}`}>
                                            <span className="font-semibold">{index + 1}</span>
                                        </div>

                                        {/* User Avatar */}
                                        <div className="flex-shrink-0">
                                            <div className="w-fit h-fit p-2 text-sm rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center text-white font-normal">
                                                {getInitials(user.firstname, user.lastname)}
                                            </div>
                                        </div>

                                        {/* User Info */}
                                        <div>
                                            <h3 className="text-sm text-gray-900">{user.firstname} {user.lastname}</h3>
                                        </div>
                                    </div>

                                    {/* Rewards */}
                                    <div className="flex items-center space-x-6">
                                        {/* Points */}
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-amber-600">{user.rewards.points || 0}</p>
                                            <p className="text-sm text-gray-500">Points</p>
                                        </div>

                                        {/* Coffee Coupons */}
                                        <div className="text-right min-w-[120px]">
                                            <div className="flex items-center justify-end space-x-2">
                                                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-xl font-semibold text-gray-900">{user.rewards.freeCoffee || 0}</p>
                                            </div>
                                            <p className="text-sm text-gray-500">Free Coffee Coupons</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
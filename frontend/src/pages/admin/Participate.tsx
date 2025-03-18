import React, { useState, useEffect } from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import { useParams } from 'react-router-dom';
import { ApiEndPoints } from '../../data/ApiEndPoints';
import { Loader } from '../../components/Loader';
import { Flag } from '../../components/icons/Flag';

// Define the response structure
interface ChallengeResponse {
  success: boolean;
  message: string;
  data: {
    totalParticipants: number;
    participants: Array<{
      _id: string;
      firstname: string;
      lastname: string;
      challenges: Array<{
        _id: string;
        title: string;
        isCompleted: boolean;
        like_video_count: number;
        share_video_count: number;
      }>;
      rewards: {
        points: number;
        freeCoffee: number;
      };
    }>;
  };
}

export const Participate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ChallengeResponse['data'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const abortController = new AbortController();
      const axiosConfig: AxiosRequestConfig = {
        url: `${ApiEndPoints.getQuestParticipantsDetails}?questId=${id}`,
        method: 'GET',
        signal: abortController.signal,
        headers: {
          Authorization: localStorage.getItem('token')
        }
      };
      const response: { data: ChallengeResponse } = await axios(axiosConfig);
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const filteredParticipants = data?.participants.filter(
    participant =>
      participant.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.lastname.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="px-28 py-6 space-y-6">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="bg-amber-50 text-amber-800 py-2 px-4 rounded-lg border border-amber-200">
            <span className="font-medium">Total Participants: {data?.totalParticipants || 0}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search participants..."
              className="w-64 px-4 py-2 rounded-lg bg-gray-100 font-light text-sm text-black focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Column Headers - Sticky */}
      <div className="w-full bg-[#efede5] rounded-xl py-4 border-b border-gray-200 px-6">
        <div className="grid grid-cols-12 gap-6 w-full">
          <div className="col-span-3">
            <h3 className="text-sm font-semibold text-gray-600">User Details</h3>
          </div>
          <div className="col-span-3">
            <h3 className="text-sm font-semibold text-gray-600">Rewards</h3>
          </div>
          <div className="col-span-6">
            <div className="overflow-x-scroll">
              <div className="flex gap-2 min-w-max">
                {filteredParticipants[0]?.challenges.map((_, index) => (
                  <div key={index} className="w-16 text-center">
                    <h3 className="text-sm font-semibold text-gray-600 flex items-center justify-center gap-2"> 
                      <div><Flag className='size-4'/></div> 
                      <div>{index + 1}</div>
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Participants List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : (
          <div className="grid gap-4 overflow-y-scroll h-full">
            {filteredParticipants.map((participant, index) => (
              <div key={participant._id} className="rounded-2xl shadow-sm bg-[#efede5] border border-gray-100 p-6">
                <div className="grid grid-cols-12 gap-6">
                  {/* User Info */}
                  <div className="col-span-3 flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center text-white text-lg font-medium">
                        {participant.firstname[0]}{participant.lastname[0]}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-medium">{participant.firstname} {participant.lastname}</h3>
                      <p className="text-gray-500 text-sm">Rank #{index + 1}</p>
                    </div>
                  </div>

                  {/* Rewards */}
                  <div className="col-span-3 flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber-600">{participant.rewards.points || 0}</p>
                      <p className="text-sm text-gray-500">Points</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber-600">{participant.rewards.freeCoffee || 0}</p>
                      <p className="text-sm text-gray-500">Free Coffee</p>
                    </div>
                  </div>

                  {/* Challenge Grid */}
                  <div className="col-span-6">
                    <div className="overflow-x-scroll">
                      <div className="flex gap-2 min-w-max">
                        {participant.challenges.map((challenge) => (
                          <div
                            key={challenge._id}
                            className={`w-16 h-12 rounded-lg flex items-center justify-center transition-colors ${
                              challenge.isCompleted
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {challenge.isCompleted ? (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>
                        ))}
                      </div>
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
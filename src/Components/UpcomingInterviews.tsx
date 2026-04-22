import { Calendar, Clock, MapPin, Video, User } from 'lucide-react';

interface InterviewInfo {
  id: string;
  company: string;
  position: string;
  date: string;
  time: string;
  type: string;
  interviewer: string;
  location: string;
  round: string;
  notes: string;
}

export function UpcomingInterviews() {
  const interviews: InterviewInfo[] = [];

  const getTypeIcon = (type: string) => {
    if (type === 'Video Call') return Video;
    if (type === 'Phone Call') return Calendar;
    return MapPin;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white border border-blue-700">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-8 h-8" />
          <h2 className="text-2xl font-semibold">Upcoming Interviews</h2>
        </div>
        <p className="text-blue-100">You have {interviews.length} interviews scheduled this week</p>
      </div>

      {/* Interviews List */}
      <div className="space-y-4">
        {interviews.map((interview) => {
          const TypeIcon = getTypeIcon(interview.type);
          return (
            <div key={interview.id} className="surface rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <TypeIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{interview.position}</h3>
                        <p className="text-gray-600 dark:text-gray-300">{interview.company}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {new Date(interview.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Clock className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                      <span className="text-sm">{interview.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                      <span className="text-sm">{interview.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <User className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                      <span className="text-sm">{interview.interviewer}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-sm">
                      {interview.round}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {interview.type}
                    </span>
                  </div>

                  {interview.notes && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        <span className="font-medium">Notes:</span> {interview.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap">
                    Join Meeting
                  </button>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips Section */}
      <div className="surface rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Interview Preparation Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 dark:text-green-300 font-semibold">1</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Research the Company</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Review their products, culture, and recent news</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 dark:text-green-300 font-semibold">2</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Practice Common Questions</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Prepare answers for behavioral and technical questions</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 dark:text-green-300 font-semibold">3</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Test Your Tech</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Check your camera, mic, and internet connection</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 dark:text-green-300 font-semibold">4</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Prepare Questions</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Have thoughtful questions ready for the interviewer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

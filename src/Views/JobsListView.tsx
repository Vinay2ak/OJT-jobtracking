/* eslint-disable @typescript-eslint/no-explicit-any */
import { jobsData } from '../data/mockData';
import { Search, Filter, MoreHorizontal, Plus } from 'lucide-react';

export default function JobsListView() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative max-w-md w-full">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search roles or companies..." 
            className="input w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
          />
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button className="flex items-center gap-2 px-4 py-2.5 surface border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 shadow-sm transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 rounded-xl text-sm font-semibold text-white hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-all hover:shadow-md hover:-translate-y-0.5">
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>
      </div>

      <div className="surface rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80 dark:bg-gray-700 text-left text-xs uppercase tracking-wider text-gray-500 dark:text-gray-300 font-bold border-b border-gray-100 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Salary</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700 text-sm">
              {jobsData.map((job: any) => {
                const status = String(job.status || '').toLowerCase();
                return (
                <tr key={job.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700 transition-colors group">
                  <td className="px-6 py-4.5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-200 flex items-center justify-center font-bold text-xs ring-1 ring-gray-200 dark:ring-gray-600 group-hover:ring-blue-200 transition-all shadow-sm">
                        {job.logo}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 dark:text-gray-100 block leading-tight">{job.company}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{job.location}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4.5 font-semibold text-gray-700 dark:text-gray-100">{job.role}</td>
                  <td className="px-6 py-4.5">
                    <span className={`status ${status === 'interviewing' ? 'status-interviewing' :
                        status === 'offered' ? 'status-offered' :
                        status === 'rejected' ? 'status-rejected' : 'status-applied'
                      } px-3 py-1.5 inline-block`}>
                      {job.status?.charAt(0)?.toUpperCase() + job.status?.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 text-gray-600 dark:text-gray-200 font-medium">{job.salary}</td>
                  <td className="px-6 py-4.5 text-gray-500 dark:text-gray-400 font-medium">{job.location}</td>
                  <td className="px-6 py-4.5 text-gray-500 dark:text-gray-400 font-medium">{job.updated}</td>
                  <td className="px-6 py-4.5 text-right">
                    <button className="text-gray-400 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Database, FileText, Folder, RefreshCw } from "lucide-react";
import { authFetch } from "@/lib/authFetch";

interface DatabaseRow {
  standardName: string;
  folder: string;
  text: string;
}

export default function DatabaseExplorer() {
  const [data, setData] = useState<DatabaseRow[]>([]);
  const [stats, setStats] = useState<{ totalRules: number }>({ totalRules: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await authFetch("/api/standards/stats");
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats({ totalRules: statsData.totalRules });
      }

      const dataRes = await authFetch("/api/standards/data?limit=2000");
      const dataData = await dataRes.json();
      if (dataData.success) {
        setData(dataData.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Database Explorer (LanceDB)</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Rules Ingested</h3>
            <Database className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats.totalRules.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Stored securely on local disk</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-6 flex flex-col space-y-1.5 border-b">
          <h3 className="font-semibold leading-none tracking-tight">Recent Standard Chunks</h3>
          <p className="text-sm text-muted-foreground">Showing the first 2000 rules saved in the database.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Standard / Folder</th>
                <th className="px-6 py-4 font-medium">Rule Text</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-muted-foreground">
                    Database is currently empty. Run the ingestion script to see data here!
                  </td>
                </tr>
              )}
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 w-1/3">
                    <div className="flex items-center gap-2 font-medium text-indigo-600">
                      <FileText className="w-4 h-4" />
                      {row.standardName}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Folder className="w-3 h-3" />
                      {row.folder}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm line-clamp-3" title={row.text}>
                      {row.text}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


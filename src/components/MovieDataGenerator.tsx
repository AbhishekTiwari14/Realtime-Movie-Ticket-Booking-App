import { generateMovieData } from "@/lib/generateMovieData";
import { useState } from "react";

export const MovieDataGenerator: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    const handleGenerateData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await generateMovieData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Movie Schedule Generator</h1>
        <button
          onClick={handleGenerateData}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {isLoading ? 'Generating Schedules...' : 'Generate Movie Schedules'}
        </button>
        {error && (
          <div className="mt-4 text-red-500">
            Error: {error}
          </div>
        )}
      </div>
    );
  };
import React, { useState } from 'react';
import { Link, AlertCircle, CheckCircle } from 'lucide-react';
import { validateRepoUrl, linkProjectRepository } from '../../services/github.api';

interface LinkRepoFormProps {
  projectId: string;
  onSuccess: () => void;
  className?: string;
}

const LinkRepoForm: React.FC<LinkRepoFormProps> = ({
  projectId,
  onSuccess,
  className = ''
}) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a repository URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate URL first
      const validation = await validateRepoUrl(url);
      
      if (!validation.isValid) {
        setError(validation.message || 'Invalid repository URL');
        return;
      }

      // Link the repository
      await linkProjectRepository(projectId, url);
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
      
    } catch (err) {
      console.error('Failed to link repository:', err);
      setError(err instanceof Error ? err.message : 'Failed to link repository');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError(null);
    setSuccess(false);
  };

  if (success) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Repository Linked Successfully!
            </h3>
            <p className="text-sm text-gray-600">
              Loading repository data and contributors...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Link className="w-6 h-6 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Link GitHub Repository
        </h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-6">
        Connect a GitHub repository to enable code access and track contributions for this project.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="repo-url" className="block text-sm font-medium text-gray-700 mb-2">
            Repository URL
          </label>
          <input
            id="repo-url"
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://github.com/owner/repository"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Linking Repository...
            </>
          ) : (
            <>
              <Link className="w-4 h-4" />
              Link Repository
            </>
          )}
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-500">
        <p>Make sure the repository is accessible and you have the necessary permissions.</p>
      </div>
    </div>
  );
};

export default LinkRepoForm;

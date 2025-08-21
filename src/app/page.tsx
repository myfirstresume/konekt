'use client';

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UploadBox from "@/components/UploadBox";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { userId, isLoading } = useAuth();

  const handleUploadSuccess = (fileUrl: string, filename: string) => {
    // Handle successful upload - could redirect to AI review page
    console.log('Upload successful:', { fileUrl, filename });
    // Here you would typically redirect to the AI review page
    // or trigger the AI processing
  };

  const handleUploadError = (error: string) => {
    // Handle upload error - could show additional error handling
    console.error('Upload error:', error);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <div className={`flex flex-col items-center justify-center ${!userId && !isLoading ? 'py-16' : 'py-32'}`}>
            {!userId && !isLoading && (
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Upload your resume to get started!
                </h1>
              </div>
            )}
            <UploadBox 
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>
          
          {/* Additional content to push footer down - only show when signed in */}
          {userId && !isLoading && (
            <div className="py-8">
              <div className="text-center text-gray-500 text-sm">
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

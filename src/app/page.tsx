'use client';

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UploadBox from "@/components/UploadBox";

export default function Home() {
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
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <UploadBox 
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
      </main>
      <Footer />
    </div>
  );
}

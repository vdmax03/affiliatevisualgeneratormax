
import React from 'react';

const messages = [
  "Analyzing product features...",
  "Building visual concepts...",
  "Generating studio shots...",
  "Creating lifestyle scenes...",
  "Crafting compelling copy...",
  "Almost there, finalizing assets..."
];

export const LoadingSpinner: React.FC = () => {
    const [message, setMessage] = React.useState(messages[0]);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = messages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % messages.length;
                return messages[nextIndex];
            });
        }, 2000); // Change message every 2 seconds

        return () => clearInterval(intervalId);
    }, []);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex flex-col items-center justify-center z-50">
      <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-brand-secondary rounded-full animate-spin"></div>
      <p className="mt-4 text-white text-lg font-semibold transition-opacity duration-500">{message}</p>
    </div>
  );
};

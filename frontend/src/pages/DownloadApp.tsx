import logo from "../assets/app-logo.png";
import appScreenshot from "../assets/app-screenshot.png";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import { Link } from "react-router-dom";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "../data/Constants";

export const DownloadApp = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-[#f8f7f3] font-sans">
      <div className="max-w-5xl text-center">
        <div className="mb-4">
          <img
            src={logo}
            alt="App Logo"
            className="w-16 h-16 rounded-xl mx-auto"
          />
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Get Starbucks for Mobile
        </h1>

        <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl mx-auto">
          Get started with Starbucks Rewards Program in seconds, download the
          app and join the Quest.
        </p>
        <div className="flex justify-center gap-4 mb-12 md:flex-row flex-col items-center">
          <Link
            to={APP_STORE_URL}
            className="flex items-center bg-black text-white py-2 px-4 rounded-lg no-underline min-w-40"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaApple className="text-3xl mr-2" />
            <div className="flex flex-col items-start">
              <span className="text-xs font-normal">Download on the</span>
              <span className="text-base font-medium">App Store</span>
            </div>
          </Link>
          <Link
            to={GOOGLE_PLAY_URL}
            className="flex items-center bg-black text-white py-2 px-4 rounded-lg no-underline min-w-40"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGooglePlay className="text-3xl mr-2" />
            <div className="flex flex-col items-start">
              <span className="text-xs font-normal">GET IT ON</span>
              <span className="text-base font-medium">Google Play</span>
            </div>
          </Link>
        </div>

        <div className="flex justify-center mt-8 max-w-full">
          <img
            src={appScreenshot}
            alt="App Screenshot"
            className="max-w-3xl w-full h-auto md:max-w-full"
          />
        </div>
      </div>
    </div>
  );
};

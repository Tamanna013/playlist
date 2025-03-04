import { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
import axios from "axios";
import { Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";

// Your tracks array with static lyrics
const tracks = [
  {
    id: 1,
    title: "Harleys In Hawaii",
    artist: "Katy Perry",
    src: "/HarleysInHawaii.mp3",
    albumArt: "/harleys.png",
  },
  // Other tracks here...
];

const videoId = "TB2lhu89tRfSL_0Z";

// Function to fetch lyrics from YouTube API
const fetchLyrics = async (videoId) => {
  try {
    // Replace with your actual YouTube API key and video ID
    const YOUTUBE_API_KEY = "YOUR_YOUTUBE_API_KEY";

    // Step 1: Fetch captions using YouTube API
    const response = await axios.get("https://www.googleapis.com/youtube/v3/captions", {
      params: {
        part: 'snippet',
        videoId,
        key: YOUTUBE_API_KEY,
      },
    });

    // Get the caption ID and fetch the subtitle tracks
    const captionId = response.data.items[0].id;
    const captionTracksResponse = await axios.get(`https://www.googleapis.com/youtube/v3/captions/${captionId}`, {
      params: {
        tfmt: 'srt',
        key: YOUTUBE_API_KEY,
      },
    });

    // Step 2: Parse the subtitle tracks (SRT format) into usable lyrics data
    const captionText = captionTracksResponse.data;
    const lyrics = parseSRT(captionText);
    return lyrics;

  } catch (error) {
    console.error("Error fetching captions:", error);
    return [];
  }
};

// Function to parse SRT subtitle format into { time, text }
const parseSRT = (srtText) => {
  const lines = srtText.split("\n");
  const lyrics = [];
  let currentTime = null;
  let currentText = "";

  lines.forEach((line) => {
    if (line.includes("-->")) {
      // Parse time (e.g., "00:00:01,500 --> 00:00:05,000")
      const times = line.split(" --> ");
      const startTime = times[0].trim();
      currentTime = convertSRTTimeToSeconds(startTime);
    } else if (line.trim() === "") {
      if (currentTime !== null && currentText.trim() !== "") {
        lyrics.push({ time: currentTime, text: currentText.trim() });
      }
      currentText = ""; // Reset for next block
    } else {
      currentText += line + " ";
    }
  });

  return lyrics;
};

// Function to convert SRT time format to seconds
const convertSRTTimeToSeconds = (timeStr) => {
  const [hours, minutes, seconds] = timeStr.split(":");
  const [sec, millis] = seconds.split(",");
  return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(sec) + parseInt(millis) / 1000;
};

export default function MusicPlayer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [lyrics, setLyrics] = useState(tracks[currentIndex].lyrics || []);
  const lyricsRef = useRef(null);

  useEffect(() => {
    // Fetch lyrics dynamically from YouTube captions for the current track
    const videoId = "VIDEO_ID"; // Replace with your actual YouTube video ID
    fetchLyrics(videoId).then((newLyrics) => setLyrics(newLyrics));
  }, [currentIndex]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.stop();
        sound.unload();
      }
    };
  }, [sound]);

  const playMusic = (index) => {
    if (sound) {
      sound.stop();
      sound.unload();
    }

    const newSound = new Howl({
      src: [tracks[index].src],
      html5: true,
      volume: volume,
      onend: () => skipForward(),
    });

    newSound.play();
    setSound(newSound);
    setCurrentIndex(index);
    setIsPlaying(true);

    const interval = setInterval(() => {
      setCurrentTime(newSound.seek() || 0);
    }, 500);

    return () => clearInterval(interval);
  };

  const togglePlay = () => {
    if (!sound) {
      playMusic(currentIndex);
      return;
    }

    if (isPlaying) {
      sound.pause();
    } else {
      sound.play();
    }

    setIsPlaying(!isPlaying);
  };

  const skipForward = () => {
    let nextIndex = (currentIndex + 1) % tracks.length;
    playMusic(nextIndex);
  };

  const skipBack = () => {
    let prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    playMusic(prevIndex);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (sound) {
      sound.volume(newVolume);
    }
  };

  return (
    <div className="relative flex items-center justify-center w-full h-screen bg-cover bg-center" style={{ backgroundImage: `url('/backImg.jpg')` }}>
      <div className="absolute inset-0 bg-black opacity-60"></div>
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start md:justify-center w-full max-w-5xl p-8 text-white">
        <div className="w-full md:w-1/2 flex justify-center">
          <img src={tracks[currentIndex].albumArt} alt="Album Cover" className="w-64 h-64 md:w-96 md:h-96 object-cover rounded-2xl shadow-2xl" />
        </div>
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start mt-6 md:mt-0 md:pl-8">
          <h2 className="text-4xl font-bold text-center md:text-left">{tracks[currentIndex].title}</h2>
          <p className="text-lg text-gray-300 text-center md:text-left">{tracks[currentIndex].artist}</p>
          <div className="flex items-center space-x-6 mt-6">
            <button onClick={skipBack} className="p-2 bg-gray-800 rounded-full"><SkipBack size={24} className="text-white" /></button>
            <button onClick={togglePlay} className="p-4 bg-pink-500 rounded-full shadow-lg hover:bg-pink-600 transition">{isPlaying ? <Pause size={32} color="white" /> : <Play size={32} color="white" />}</button>
            <button onClick={skipForward} className="p-2 bg-gray-800 rounded-full"><SkipForward size={24} className="text-white" /></button>
          </div>
          <div className="mt-8 w-full max-h-48 overflow-hidden">
            <div ref={lyricsRef} className="text-gray-300 text-lg text-center space-y-2 transition-all duration-500">
              {lyrics.map((line, index) => (
                <p key={index} className={`transition-opacity ${currentTime >= line.time ? "text-white font-bold text-xl" : "opacity-50"}`}>{line.text}</p>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-6 w-full max-w-sm">
            <Volume2 size={20} className="text-gray-400" />
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="w-full accent-pink-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

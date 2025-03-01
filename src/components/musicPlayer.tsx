import { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
import { Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";

const tracks = [
  {
    id: 1,
    title: "Harleys In Hawaii",
    artist: "Katy Perry",
    src: "/HarleysInHawaii.mp3",
    albumArt: "/images/harleys.jpg",
    lyrics: [
      { time: 0, text: "Boy, tell me, can you take my breath away?" },
      { time: 10, text: "Cruisin' down a heart-shaped highway" },
    ],
  },
  {
    id: 2,
    title: "Reminder",
    artist: "The Weeknd",
    src: "/Reminder.mp3",
    albumArt: "/images/reminder.jpg",
    lyrics: [
      { time: 0, text: "Record man play my song on the radio" },
      { time: 12, text: "You too busy tryna find that blue-eyed soul" },
    ],
  },
  {
    id: 3,
    title: "Fetish",
    artist: "Selena Gomez",
    src: "/Fetish.mp3",
    albumArt: "/images/fetish.jpg",
    lyrics: [
      { time: 0, text: "Take it or leave it" },
      { time: 8, text: "Baby, take it or leave it" },
    ],
  },
];

export default function MusicPlayer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sound, setSound] = useState<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const lyricsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.stop();
        sound.unload();
      }
    };
  }, [sound]);

  const playMusic = (index: number) => {
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (sound) {
      sound.volume(newVolume);
    }
  };

  return (
    <div className="relative flex items-center justify-center w-full h-screen bg-cover bg-center" style={{ backgroundImage: `url('/images/background.jpg')` }}>
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
          <div className="flex items-center space-x-2 mt-6 w-full max-w-sm">
            <Volume2 size={20} className="text-gray-400" />
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="w-full accent-pink-500" />
          </div>
          <div className="mt-8 w-full max-h-48 overflow-hidden">
            <div ref={lyricsRef} className="text-gray-300 text-lg text-center space-y-2 transition-all duration-500">
              {tracks[currentIndex].lyrics?.map((line, index) => (
                <p key={index} className={`transition-opacity ${currentTime >= line.time ? "text-white font-bold text-xl" : "opacity-50"}`}>{line.text}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

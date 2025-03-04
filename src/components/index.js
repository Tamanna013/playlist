import axios from "axios";

// Replace with your YouTube Video ID and API Key
const YOUTUBE_API_KEY = "YOUR_YOUTUBE_API_KEY";
const VIDEO_ID = "VIDEO_ID"; // Replace this with the actual YouTube video ID

const fetchLyrics = async () => {
  try {
    // Step 1: Fetch the video captions using the YouTube Data API
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/captions`, {
      params: {
        part: 'snippet',
        videoId: VIDEO_ID,
        key: YOUTUBE_API_KEY,
      },
    });

    // Step 2: Get the caption ID from the response
    const captionId = response.data.items[0].id;

    // Step 3: Fetch the caption tracks (subtitles)
    const captionTracksResponse = await axios.get(`https://www.googleapis.com/youtube/v3/captions/${captionId}`, {
      params: {
        tfmt: 'srt', // Choose subtitle format
        key: YOUTUBE_API_KEY,
      },
    });

    // Step 4: Convert the caption SRT file into an array of { time, text } objects
    const captionText = captionTracksResponse.data;
    const lyrics = parseSRT(captionText);
    console.log(lyrics);
    return lyrics;

  } catch (error) {
    console.error("Error fetching captions:", error);
  }
};

// Function to parse SRT subtitle format into { time, text } array
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
      currentText = ""; // Reset for the next subtitle block
    } else {
      currentText += line + " ";
    }
  });

  return lyrics;
};

// Function to convert SRT time format (HH:MM:SS,SSS) to seconds
const convertSRTTimeToSeconds = (timeStr) => {
  const [hours, minutes, seconds] = timeStr.split(":");
  const [sec, millis] = seconds.split(",");
  return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(sec) + parseInt(millis) / 1000;
};

// Use the function in your component
useEffect(() => {
  fetchLyrics();
}, []);

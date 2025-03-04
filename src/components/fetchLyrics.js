import axios from "axios";

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const VIDEO_ID = "TB2lhu89tRfSL_0Z";

export const fetchLyrics = async () => {
  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/captions`, {
      params: {
        part: "snippet",
        videoId: VIDEO_ID,
        key: YOUTUBE_API_KEY,
      },
    });

    const captionId = response.data.items[0]?.id;
    if (!captionId) throw new Error("No lyrics available for this song.");

    const captionTracksResponse = await axios.get(`https://www.googleapis.com/youtube/v3/captions/${captionId}`, {
      params: { tfmt: "srt", key: YOUTUBE_API_KEY },
    });

    return parseSRT(captionTracksResponse.data);
  } catch (error) {
    console.error("Error fetching captions:", error);
    return [];
  }
};

const parseSRT = (srtText) => {
  const lines = srtText.split("\n");
  const lyrics = [];
  let currentTime = null, currentText = "";

  lines.forEach((line) => {
    if (line.includes("-->")) {
      const times = line.split(" --> ");
      currentTime = convertSRTTimeToSeconds(times[0].trim());
    } else if (line.trim() === "") {
      if (currentTime !== null && currentText.trim() !== "") {
        lyrics.push({ time: currentTime, text: currentText.trim() });
      }
      currentText = "";
    } else {
      currentText += line + " ";
    }
  });

  return lyrics;
};

const convertSRTTimeToSeconds = (timeStr) => {
  const [hours, minutes, seconds] = timeStr.split(":");
  const [sec, millis] = seconds.split(",");
  return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(sec) + parseInt(millis) / 1000;
};
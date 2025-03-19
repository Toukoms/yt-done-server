const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs-extra");

const app = express();
const PORT = 3000;

app.use(cors());

app.get("/info", (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).json({ error: "Missing URL" });

  const command = `yt-dlp -J "${videoUrl}"`;

  exec(command, (error, stdout) => {
    if (error)
      return res.status(500).json({
        error: "Error when trying to get youtube video info from URL",
      });

    try {
      const data = JSON.parse(stdout);
      const title = data.title;
      const thumbnail = data.thumbnails.pop().url;
      const author = data.uploader;
      const duration = data.duration;

      const videoAudioFormats = data.formats
        .filter((f) => f.vcodec !== "none" && f.acodec !== "none") // video + audio
        .map(
          (f) =>
            f.resolution && {
              format_id: f.format_id,
              ext: f.ext,
              resolution: f.resolution,
              fps: f.fps || "N/A",
              size: f.filesize
                ? `${(f.filesize / 1024 / 1024).toFixed(2)} MB`
                : "unknown",
            }
        );

      const audios = data.formats.filter(
        (f) => f.vcodec === "none" && f.acodec !== "none"
      ); // audio only
      const audioFormats = [];
      for (const audio of audios) {
        if (audio.abr) {
          audioFormats.push({
            format_id: audio.format_id,
            ext: audio.ext,
            bitrate: `${audio.abr} kbps`,
            size: audio.filesize
              ? `${(audio.filesize / 1024 / 1024).toFixed(2)} MB`
              : "unknown",
          });
        }
      }

      res.json({
        title,
        thumbnail,
        author,
        duration,
        videoAudioFormats,
        audioFormats,
      });
    } catch (parseError) {
      res.status(500).json({ error: "Error getting video formats" });
    }
  });
});

app.get("/download", async (req, res) => {
  const { url, format_id, title } = req.query;
  if (!url || !format_id)
    return res.status(400).json({ error: "Missing Params" });

  const fileName = title && title.length > 0 ? title : `${Date.now()}_youtube`;
  const outputPath = `./downloads/${fileName}.${
    format_id.includes("audio") ? "mp3" : "mp4"
  }`;
  const command = `yt-dlp -f ${format_id} -o "${outputPath}" "${url}"`;

  exec(command, async (error) => {
    if (error) return res.status(500).json({ error: "Error downloading file" });

    res.download(outputPath, fileName, async (err) => {
      if (err) console.error("Error sending file :", err);

      try {
        await fs.unlink(outputPath);
        console.log("File removed:", outputPath);
      } catch (unlinkErr) {
        console.error("Error removing file:", unlinkErr);
      }
    });
  });
});

if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
}

module.exports = app;

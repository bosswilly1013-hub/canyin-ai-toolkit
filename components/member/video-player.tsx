"use client";

import { useRef, useState } from "react";

function clock(seconds: number) {
  const value = Math.max(0, Math.floor(seconds));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}

export function VideoPlayer({ src }: { src: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);

  function toggle() {
    const node = video.current;
    if (!node) return;
    if (node.paused) void node.play();
    else node.pause();
  }

  return (
    <div className="player">
      <video
        ref={video}
        src={src}
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={() => setTime(video.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(video.current?.duration || 0)}
      />
      {!playing ? (
        <button type="button" className="big-play" onClick={toggle} aria-label="播放">
          播放
        </button>
      ) : null}
      <div className="player-bar">
        <button type="button" onClick={toggle}>{playing ? "暫停" : "播放"}</button>
        <input
          aria-label="進度"
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={time}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (video.current) video.current.currentTime = next;
            setTime(next);
          }}
        />
        <span>{clock(time)} / {clock(duration)}</span>
        <label>
          速度
          <select
            aria-label="速度"
            value={speed}
            onChange={(event) => {
              const next = Number(event.target.value);
              setSpeed(next);
              if (video.current) video.current.playbackRate = next;
            }}
          >
            {[1, 1.25, 1.5, 2].map((rate) => <option key={rate} value={rate}>{rate}x</option>)}
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            const node = video.current;
            if (!node) return;
            if (document.fullscreenElement) void document.exitFullscreen();
            else void node.requestFullscreen();
          }}
        >
          全螢幕
        </button>
      </div>
    </div>
  );
}

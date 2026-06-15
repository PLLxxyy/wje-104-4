import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import styles from "./styles.module.css";

const SPEED_OPTIONS = [0.25, 0.5, 1, 1.5, 2, 4] as const;

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTime: number;
  totalDuration: number;
  speed: number;
  totalStrokes: number;
  currentStrokeIndex: number;
  onToggle: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
  onPrevStroke: () => void;
  onNextStroke: () => void;
  onSpeedChange: (speed: number) => void;
}

const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const remainingMs = Math.floor((ms % 1000) / 10);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}.${remainingMs.toString().padStart(2, "0")}`;
};

export const PlaybackControls = ({
  isPlaying,
  currentTime,
  totalDuration,
  speed,
  totalStrokes,
  currentStrokeIndex,
  onToggle,
  onStop,
  onSeek,
  onPrevStroke,
  onNextStroke,
  onSpeedChange
}: PlaybackControlsProps): JSX.Element => {
  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;
  const strokeDisplay = totalStrokes > 0 ? `${Math.max(0, currentStrokeIndex + 1)} / ${totalStrokes}` : "0 / 0";

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = Number(event.target.value);
    onSeek((value / 100) * totalDuration);
  };

  return (
    <div className={styles.container} role="group" aria-label="回放控制面板">
      <div className={styles.progressRow}>
        <span className={styles.timeLabel}>{formatTime(currentTime)}</span>
        <input
          type="range"
          className={styles.progressSlider}
          min={0}
          max={100}
          step={0.1}
          value={progressPercent}
          onChange={handleSliderChange}
          aria-label="回放进度"
          disabled={totalDuration === 0}
        />
        <span className={styles.timeLabel}>{formatTime(totalDuration)}</span>
      </div>

      <div className={styles.controlsRow}>
        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.controlButton}
            onClick={onStop}
            title="重置到开头"
            disabled={totalDuration === 0}
          >
            <RotateCcw size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.controlButton}
            onClick={onPrevStroke}
            title="上一笔"
            disabled={currentStrokeIndex <= 0}
          >
            <SkipBack size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`${styles.controlButton} ${styles.playButton}`}
            onClick={onToggle}
            title={isPlaying ? "暂停" : "播放"}
            disabled={totalDuration === 0}
          >
            {isPlaying ? <Pause size={20} aria-hidden="true" /> : <Play size={20} aria-hidden="true" />}
          </button>
          <button
            type="button"
            className={styles.controlButton}
            onClick={onNextStroke}
            title="下一笔"
            disabled={currentStrokeIndex >= totalStrokes - 1}
          >
            <SkipForward size={16} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.infoGroup}>
          <span className={styles.strokeCounter} title="当前笔画数">
            第 {strokeDisplay} 笔
          </span>
        </div>

        <div className={styles.speedGroup}>
          <label htmlFor="playback-speed" className={styles.speedLabel}>
            速度
          </label>
          <select
            id="playback-speed"
            className={styles.speedSelect}
            value={speed}
            onChange={(event) => onSpeedChange(Number(event.target.value))}
          >
            {SPEED_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}x
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

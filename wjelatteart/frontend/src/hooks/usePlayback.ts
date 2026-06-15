import { useCallback, useEffect, useRef, useState } from "react";
import { Layer } from "../types/layer";
import { Point, Stroke } from "../types/stroke";
import { cloneLayers } from "../utils/canvas";

export interface PlaybackStroke {
  stroke: Stroke;
  layerId: string;
  layerIndex: number;
  strokeIndex: number;
  startTime: number;
  endTime: number;
}

export interface PlaybackState {
  isPlaying: boolean;
  speed: number;
  totalDuration: number;
  currentTime: number;
  totalStrokes: number;
  currentStrokeIndex: number;
  currentPointIndex: number;
}

export interface PlaybackResult extends PlaybackState {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  stop: () => void;
  seekToTime: (time: number) => void;
  seekToStroke: (strokeIndex: number) => void;
  setSpeed: (speed: number) => void;
  getPlaybackLayers: () => Layer[];
}

interface FlattenedStroke {
  stroke: Stroke;
  layerId: string;
  layerIndex: number;
  strokeIndex: number;
  originalStartTime: number;
}

const flattenStrokes = (layers: Layer[]): FlattenedStroke[] => {
  const result: FlattenedStroke[] = [];
  layers.forEach((layer, layerIndex) => {
    layer.strokes.forEach((stroke, strokeIndex) => {
      if (stroke.points.length === 0) {
        return;
      }
      result.push({
        stroke,
        layerId: layer.id,
        layerIndex,
        strokeIndex,
        originalStartTime: stroke.points[0].timestamp
      });
    });
  });
  result.sort((a, b) => a.originalStartTime - b.originalStartTime);
  return result;
};

const buildPlaybackTimeline = (
  layers: Layer[],
  minStrokeDuration: number = 400
): { strokes: PlaybackStroke[]; totalDuration: number } => {
  const flattened = flattenStrokes(layers);
  const playbackStrokes: PlaybackStroke[] = [];
  let currentTime = 0;

  flattened.forEach((item) => {
    const { stroke } = item;
    const firstPoint = stroke.points[0];
    const lastPoint = stroke.points[stroke.points.length - 1];
    const rawDuration = Math.max(lastPoint.timestamp - firstPoint.timestamp, 0);
    const duration = Math.max(rawDuration, minStrokeDuration);

    playbackStrokes.push({
      stroke,
      layerId: item.layerId,
      layerIndex: item.layerIndex,
      strokeIndex: item.strokeIndex,
      startTime: currentTime,
      endTime: currentTime + duration
    });

    currentTime += duration;
  });

  return {
    strokes: playbackStrokes,
    totalDuration: currentTime
  };
};

const buildPartialStroke = (stroke: Stroke, progress: number): Stroke => {
  if (progress <= 0) {
    return { ...stroke, points: [] };
  }
  if (progress >= 1) {
    return stroke;
  }
  const totalPoints = stroke.points.length;
  const splitIndex = Math.floor(totalPoints * progress);
  if (splitIndex === 0) {
    return { ...stroke, points: [stroke.points[0]] };
  }
  return {
    ...stroke,
    points: stroke.points.slice(0, splitIndex + 1)
  };
};

export const usePlayback = (layers: Layer[]): PlaybackResult => {
  const timelineRef = useRef<{ strokes: PlaybackStroke[]; totalDuration: number }>({
    strokes: [],
    totalDuration: 0
  });
  const animationFrameRef = useRef<number | undefined>();
  const lastTickRef = useRef<number>(0);
  const layersRef = useRef<Layer[]>(layers);

  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeedState] = useState(1);
  const [totalDuration, setTotalDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(-1);
  const [currentPointIndex, setCurrentPointIndex] = useState(-1);

  layersRef.current = layers;

  const rebuildTimeline = useCallback((): void => {
    const timeline = buildPlaybackTimeline(layersRef.current);
    timelineRef.current = timeline;
    setTotalDuration(timeline.totalDuration);
    setCurrentTime(0);
    setCurrentStrokeIndex(-1);
    setCurrentPointIndex(-1);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    rebuildTimeline();
  }, [layers, rebuildTimeline]);

  const findCurrentStrokeProgress = (
    time: number
  ): { strokeIndex: number; pointProgress: number; pointIndex: number } => {
    const { strokes } = timelineRef.current;
    if (strokes.length === 0) {
      return { strokeIndex: -1, pointProgress: 0, pointIndex: -1 };
    }
    for (let i = 0; i < strokes.length; i += 1) {
      const playbackStroke = strokes[i];
      if (time >= playbackStroke.startTime && time < playbackStroke.endTime) {
        const strokeDuration = playbackStroke.endTime - playbackStroke.startTime;
        const progress = strokeDuration > 0 ? (time - playbackStroke.startTime) / strokeDuration : 1;
        const totalPoints = playbackStroke.stroke.points.length;
        return {
          strokeIndex: i,
          pointProgress: progress,
          pointIndex: Math.max(0, Math.floor(totalPoints * progress) - 1)
        };
      }
    }
    if (time >= strokes[strokes.length - 1].endTime) {
      const last = strokes[strokes.length - 1];
      return {
        strokeIndex: strokes.length - 1,
        pointProgress: 1,
        pointIndex: last.stroke.points.length - 1
      };
    }
    return { strokeIndex: -1, pointProgress: 0, pointIndex: -1 };
  };

  const tick = useCallback(
    (now: number): void => {
      if (!isPlaying) {
        return;
      }
      const delta = (now - lastTickRef.current) * speed;
      lastTickRef.current = now;

      const nextTime = Math.min(currentTime + delta, timelineRef.current.totalDuration);
      setCurrentTime(nextTime);

      const { strokeIndex, pointIndex } = findCurrentStrokeProgress(nextTime);
      setCurrentStrokeIndex(strokeIndex);
      setCurrentPointIndex(pointIndex);

      if (nextTime >= timelineRef.current.totalDuration) {
        setIsPlaying(false);
        return;
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    },
    [isPlaying, speed, currentTime]
  );

  useEffect(() => {
    if (isPlaying) {
      lastTickRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(tick);
    } else if (animationFrameRef.current !== undefined) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, tick]);

  const play = useCallback((): void => {
    if (timelineRef.current.strokes.length === 0) {
      return;
    }
    if (currentTime >= timelineRef.current.totalDuration) {
      setCurrentTime(0);
      setCurrentStrokeIndex(-1);
      setCurrentPointIndex(-1);
    }
    setIsPlaying(true);
  }, [currentTime]);

  const pause = useCallback((): void => {
    setIsPlaying(false);
  }, []);

  const toggle = useCallback((): void => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const stop = useCallback((): void => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentStrokeIndex(-1);
    setCurrentPointIndex(-1);
  }, []);

  const seekToTime = useCallback((time: number): void => {
    const clamped = Math.max(0, Math.min(time, timelineRef.current.totalDuration));
    setCurrentTime(clamped);
    const { strokeIndex, pointIndex } = findCurrentStrokeProgress(clamped);
    setCurrentStrokeIndex(strokeIndex);
    setCurrentPointIndex(pointIndex);
  }, []);

  const seekToStroke = useCallback((strokeIndex: number): void => {
    const { strokes } = timelineRef.current;
    if (strokes.length === 0) {
      return;
    }
    const clampedIndex = Math.max(-1, Math.min(strokeIndex, strokes.length - 1));
    if (clampedIndex < 0) {
      seekToTime(0);
      return;
    }
    const target = strokes[clampedIndex];
    seekToTime(target.startTime);
  }, [seekToTime]);

  const setSpeed = useCallback((nextSpeed: number): void => {
    const clamped = Math.max(0.25, Math.min(nextSpeed, 4));
    setSpeedState(clamped);
  }, []);

  const getPlaybackLayers = useCallback((): Layer[] => {
    const { strokes } = timelineRef.current;
    if (strokes.length === 0) {
      return cloneLayers(layersRef.current).map((layer) => ({ ...layer, strokes: [] }));
    }

    const sourceLayers = cloneLayers(layersRef.current);
    const layerStrokesMap = new Map<string, Stroke[]>();
    sourceLayers.forEach((layer) => {
      layerStrokesMap.set(layer.id, []);
    });

    const { strokeIndex, pointProgress } = findCurrentStrokeProgress(currentTime);

    for (let i = 0; i < strokes.length; i += 1) {
      const playbackStroke = strokes[i];
      if (i < strokeIndex) {
        const layerStrokes = layerStrokesMap.get(playbackStroke.layerId);
        layerStrokes?.push(playbackStroke.stroke);
      } else if (i === strokeIndex) {
        const partial = buildPartialStroke(playbackStroke.stroke, pointProgress);
        const layerStrokes = layerStrokesMap.get(playbackStroke.layerId);
        layerStrokes?.push(partial);
        break;
      }
    }

    return sourceLayers.map((layer) => ({
      ...layer,
      strokes: layerStrokesMap.get(layer.id) ?? []
    }));
  }, [currentTime]);

  return {
    isPlaying,
    speed,
    totalDuration,
    currentTime,
    totalStrokes: timelineRef.current.strokes.length,
    currentStrokeIndex,
    currentPointIndex,
    play,
    pause,
    toggle,
    stop,
    seekToTime,
    seekToStroke,
    setSpeed,
    getPlaybackLayers
  };
};

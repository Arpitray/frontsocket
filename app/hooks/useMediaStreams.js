'use client';
import { useRef, useState, useCallback } from 'react';

/**
 * Custom hook to manage all media streams (camera, screen share, video file)
 * Provides unified interface for starting, stopping, and managing media streams
 */
export function useMediaStreams() {
  // Stream refs
  const localStreamRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const micTrackRef = useRef(null);

  // State
  const [isStreaming, setIsStreaming] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);

  /**
   * Enumerate available camera devices
   */
  const getCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(videoDevices);
      console.log('[CAMERA] Found cameras:', videoDevices.length);
      return videoDevices;
    } catch (err) {
      console.warn('[CAMERA] Could not enumerate devices:', err);
      return [];
    }
  }, []);

  /**
   * Start camera with optional audio
   */
  const startCamera = useCallback(async (options = {}) => {
    const { deviceId = null, includeAudio = true } = options;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Your browser doesn't support camera access.");
    }

    let camera = null;
    const videoConstraints = {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      ...(deviceId && { deviceId: { exact: deviceId } })
    };

    const audioConstraints = includeAudio ? {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      latency: { ideal: 0 },
      channelCount: 1
    } : false;

    try {
      camera = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: audioConstraints
      });
      console.log('[CAMERA] Got camera with audio:', includeAudio);
    } catch (err) {
      console.warn('[CAMERA] Failed to get camera with audio:', err.name);
      // Fallback: try video only
      camera = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
      console.log('[CAMERA] Got camera without audio');
    }

    if (!camera) {
      throw new Error('Failed to initialize camera stream');
    }

    // Create stream with identifiable ID
    const cameraStream = new MediaStream();
    camera.getTracks().forEach(track => cameraStream.addTrack(track));
    
    Object.defineProperty(cameraStream, 'id', {
      value: 'camera_' + Math.random().toString(36).substr(2, 9),
      writable: false
    });

    cameraStreamRef.current = cameraStream;
    setIsCameraActive(true);
    setIsStreaming(true);

    // Store audio track reference
    const audioTrack = cameraStream.getAudioTracks()[0];
    if (audioTrack) {
      micTrackRef.current = audioTrack;
      setMicEnabled(true);
    }

    return cameraStream;
  }, []);

  /**
   * Flip/switch between available cameras
   */
  const flipCamera = useCallback(async () => {
    if (availableCameras.length <= 1) {
      throw new Error('No other cameras available to switch to.');
    }

    // Stop current camera stream
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
    }

    // Switch to next camera
    const nextIndex = (currentCameraIndex + 1) % availableCameras.length;
    setCurrentCameraIndex(nextIndex);
    const deviceId = availableCameras[nextIndex].deviceId;

    console.log('[CAMERA] Switching to camera:', availableCameras[nextIndex].label);

    const newStream = await startCamera({ deviceId });
    localStreamRef.current = newStream;

    return { stream: newStream, deviceId, index: nextIndex };
  }, [availableCameras, currentCameraIndex, startCamera]);

  /**
   * Start screen sharing with optional microphone
   */
  const startScreenShare = useCallback(async (options = {}) => {
    const { includeMic = false } = options;

    let screenStream;
    try {
      screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: true // System audio capture (Chrome/Edge)
      });
    } catch (err) {
      console.error('[SCREEN] Screen share denied:', err);
      throw new Error('Screen sharing was denied.');
    }

    console.log('[SCREEN] Screen stream obtained');

    // Get audio tracks from screen share
    const screenAudioTracks = screenStream.getAudioTracks();
    console.log('[SCREEN] System audio tracks available:', screenAudioTracks.length);

    let micStream = null;
    if (includeMic) {
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        console.log('[MIC] Microphone access granted');
      } catch (err) {
        console.error('[MIC] Microphone denied:', err);
        micStream = null;
      }
    }

    // Create final stream with separate audio tracks
    const finalStream = new MediaStream();

    // Add screen video track
    screenStream.getVideoTracks().forEach(track => {
      finalStream.addTrack(track);
      console.log('[VIDEO] Added screen video track');
    });

    // Add system audio track if available
    if (screenAudioTracks.length > 0) {
      finalStream.addTrack(screenAudioTracks[0]);
      console.log('[AUDIO] Added system audio as separate track');
    }

    // Add microphone track if user opted in
    if (micStream && micStream.getAudioTracks().length > 0) {
      const micTrack = micStream.getAudioTracks()[0];
      finalStream.addTrack(micTrack);
      micTrackRef.current = micTrack;
      setMicEnabled(true);
      console.log('[AUDIO] Added microphone as separate track');
    }

    // Override stream ID
    Object.defineProperty(finalStream, 'id', {
      value: 'screen_' + Math.random().toString(36).substr(2, 9),
      writable: false
    });

    screenStreamRef.current = finalStream;
    setIsScreenSharing(true);
    setIsStreaming(true);

    // Return the original screen stream for onended handler
    return { finalStream, screenStream, micStream };
  }, []);

  /**
   * Capture video from a video element
   */
  const captureVideoElement = useCallback(async (videoEl) => {
    if (!videoEl) {
      throw new Error('No video element provided');
    }

    // Ensure video is playing
    try {
      await videoEl.play();
    } catch (err) {
      console.warn('[STREAM] play() may be blocked:', err);
    }

    // Wait until video is actually playing
    await new Promise((resolve) => {
      if (!videoEl.paused && videoEl.readyState >= 3) return resolve();
      const onplaying = () => {
        videoEl.removeEventListener('playing', onplaying);
        resolve();
      };
      videoEl.addEventListener('playing', onplaying);
      setTimeout(() => {
        try { videoEl.removeEventListener('playing', onplaying); } catch {}
        resolve();
      }, 2000);
    });

    // Try captureStream
    let stream = null;
    try {
      if (typeof videoEl.captureStream === 'function') {
        stream = videoEl.captureStream();
      } else if (typeof videoEl.mozCaptureStream === 'function') {
        stream = videoEl.mozCaptureStream();
      }
    } catch (err) {
      console.warn('[STREAM] captureStream() threw:', err);
      stream = null;
    }

    // Validate captured stream
    const hasTracks = stream && stream.getVideoTracks && stream.getVideoTracks().length > 0;
    
    if (!hasTracks) {
      console.warn('[STREAM] captureStream returned no tracks — falling back to canvas capture');
      stream = await captureViaCanvas(videoEl);
    }

    localStreamRef.current = stream;
    setIsStreaming(true);

    return stream;
  }, []);

  /**
   * Fallback canvas capture for video streaming
   */
  const captureViaCanvas = useCallback(async (videoEl) => {
    const canvas = document.createElement('canvas');
    const w = videoEl.videoWidth || 640;
    const h = videoEl.videoHeight || 360;
    const targetW = Math.min(w, 960);
    const targetH = Math.min(h, Math.round(targetW * (h / w) || 0.5625));
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');

    let rafId = null;
    let drawActive = true;
    const drawFrame = () => {
      if (!drawActive) return;
      try { ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height); } catch (e) {}
      rafId = requestAnimationFrame(drawFrame);
    };
    drawFrame();

    let stream = canvas.captureStream ? canvas.captureStream(15) : null;
    
    if (!stream) {
      console.warn('[STREAM] canvas.captureStream not available');
      try {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      } catch (err) {
        throw new Error('Unable to capture the video.');
      }
    }

    // Attach cleanup function
    stream._canvasFallback = {
      canvas,
      stop: () => {
        drawActive = false;
        if (rafId) cancelAnimationFrame(rafId);
      }
    };

    return stream;
  }, []);

  /**
   * Toggle microphone on/off
   */
  const toggleMic = useCallback(async () => {
    // Check existing mic tracks in local stream
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      const micTracks = audioTracks.filter(track => {
        const label = track.label.toLowerCase();
        return !label.includes('system') &&
               !label.includes('tab audio') &&
               !label.includes('monitor') &&
               (label.includes('mic') || label.includes('input') || 
                label.includes('default') || label.includes('built-in'));
      });

      if (micTracks.length > 0) {
        const track = micTracks[0];
        track.enabled = !track.enabled;
        micTrackRef.current = track;
        setMicEnabled(track.enabled);
        console.log('[MIC] Toggled microphone track:', track.label, 'enabled=', track.enabled);
        return track.enabled;
      }
    }

    // Toggle existing mic track reference
    if (micTrackRef.current) {
      micTrackRef.current.enabled = !micTrackRef.current.enabled;
      setMicEnabled(micTrackRef.current.enabled);
      console.log('[MIC] Toggled mic from ref, enabled=', micTrackRef.current.enabled);
      return micTrackRef.current.enabled;
    }

    // Request new microphone
    console.log('[MIC] No mic track found, requesting microphone access...');
    const micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        latency: { ideal: 0 },
        channelCount: 1
      }
    });

    const track = micStream.getAudioTracks()[0];
    if (!track) throw new Error('No microphone found');

    micTrackRef.current = track;
    setMicEnabled(true);

    if (!localStreamRef.current) {
      localStreamRef.current = new MediaStream();
    }

    try { localStreamRef.current.addTrack(track); } catch (e) {
      console.warn('Failed to add mic to local stream', e);
    }

    console.log('[MIC] Microphone added and enabled');
    return true;
  }, []);

  /**
   * Stop all active streams
   */
  const stopAllStreams = useCallback(() => {
    console.log('[STREAM] Stopping all streams...');

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      if (localStreamRef.current._canvasFallback) {
        localStreamRef.current._canvasFallback.stop();
      }
      localStreamRef.current = null;
    }

    // Stop camera stream
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
    }

    // Stop screen stream
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }

    // Stop mic track
    if (micTrackRef.current) {
      micTrackRef.current.stop();
      micTrackRef.current = null;
    }

    setIsStreaming(false);
    setIsScreenSharing(false);
    setIsCameraActive(false);
    setMicEnabled(false);

    console.log('[STREAM] All streams stopped');
  }, []);

  /**
   * Stop only the local stream (video file)
   */
  const stopLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      if (localStreamRef.current._canvasFallback) {
        localStreamRef.current._canvasFallback.stop();
      }
      localStreamRef.current = null;
    }
    setIsStreaming(false);
    console.log('[STREAM] Local stream stopped.');
  }, []);

  return {
    // Refs (for external access)
    localStreamRef,
    cameraStreamRef,
    screenStreamRef,
    micTrackRef,

    // State
    isStreaming,
    isScreenSharing,
    isCameraActive,
    micEnabled,
    availableCameras,
    currentCameraIndex,

    // State setters (for external control)
    setIsStreaming,
    setIsScreenSharing,
    setIsCameraActive,
    setMicEnabled,

    // Methods
    getCameras,
    startCamera,
    flipCamera,
    startScreenShare,
    captureVideoElement,
    toggleMic,
    stopAllStreams,
    stopLocalStream
  };
}

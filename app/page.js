'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from "./hooks/useTheme";
import { usePlaybackSync } from "./hooks/usePlaybackSync";
import { useMediaStreams } from "./hooks/useMediaStreams";
import { initSocket, closeSocket } from "./lib/socket";
import { useAuth } from "./context/AuthContext";
import { 
  createPeerConnection as createRtcPeer, 
  createOffer, 
  createAnswer as createRtcAnswer, 
  handleAnswer,
  addIceCandidate,
  addStreamTracks,
  closePeerConnection,
  isConnectionFailed,
  getStreamType
} from "./lib/rtc";
import { JoinPanel } from "./components/room/JoinPanel";
import { MembersPanelMobile } from "./components/room/MembersPanel";
import { StreamControls } from "./components/stream/StreamControls";
import { LocalPlayer } from "./components/stream/LocalPlayer";
import { RemoteGrid } from "./components/stream/RemoteGrid";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import Snowfall from 'react-snowfall';
import LoginForm from "./components/LoginForm.jsx";
import RegisterForm from './components/Registration';
import LandingPage from './components/LandingPage';

export default function App() {
  const { token } = useAuth();
  const [authView, setAuthView] = useState('landing'); // 'landing', 'login', 'signup'

  // Refsa
  const socketRef = useRef(null);
  const pcsRef = useRef({});
  const localVideoRef = useRef(null);
  const remoteContainerRef = useRef(null);

  // Media streams hook
  const {
    localStreamRef,
    cameraStreamRef,
    screenStreamRef,
    micTrackRef,
    isStreaming,
    isScreenSharing,
    isCameraActive,
    micEnabled,
    availableCameras,
    setIsStreaming,
    setIsScreenSharing,
    setIsCameraActive,
    setMicEnabled,
    getCameras,
    startCamera,
    flipCamera: flipCameraBase,
    startScreenShare,
    captureVideoElement,
    toggleMic,
    stopAllStreams: stopAllMediaStreams
  } = useMediaStreams();

  // Room state
  const [roomId, setRoomId] = useState('mystream');
  const [displayName, setDisplayName] = useState('Host');
  const [joined, setJoined] = useState(false);
  const [members, setMembers] = useState([]);

  // Theme
  const { darkMode, setDarkMode } = useTheme();

  // Video control state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // ==========================================
  // SOCKET & SIGNALING SETUP
  // ==========================================
useEffect(() => {
  if (!token) return;

  const s = initSocket(token);
  socketRef.current = s;

  return () => closeSocket();
}, [token]);

  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    s.on("existingPeers", setMembers);
    s.on("room-joined", ({ members }) => setMembers(members));
    s.on("peer-left", ({ id }) => {
      setMembers(prev => prev.filter(m => m.id !== id));
      handlePeerLeft(id);
    });

    return () => {
      s.off("existingPeers");
      s.off("room-joined");
      s.off("peer-left");
    };
  }, []);

  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    s.on("new-peer", handleNewPeer);
    s.on("signal", handleSignal);

    return () => {
      s.off("new-peer");
      s.off("signal");
    };
  }, []);

  // Use hook for video playback sync
  usePlaybackSync(socketRef);

  // Get available cameras on mount
  useEffect(() => {
    getCameras();
  }, [getCameras]);

  // ==========================================
  // PEER CONNECTION MANAGEMENT
  // ==========================================

  const createPeerConnection = useCallback((peerId) => {
    if (pcsRef.current[peerId]) return pcsRef.current[peerId];

    const remoteStream = new MediaStream();

    const pc = createRtcPeer({
      onIceCandidate: (candidate) => {
        socketRef.current?.emit('signal', {
          to: peerId,
          from: socketRef.current?.id,
          type: 'ice-candidate',
          data: candidate
        });
      },
      onTrack: (ev) => {
        console.log('[TRACK] Received track:', ev.track.kind, ev.track.label);

        ev.streams?.forEach(s => {
          s.getTracks().forEach(t => {
            if (!remoteStream.getTracks().find(existing => existing.id === t.id)) {
              remoteStream.addTrack(t);
            }
          });
        });

        const streamId = ev.streams?.[0]?.id || '';
        const streamType = getStreamType(streamId);

        if (streamType === 'camera') {
          createCameraPiP(peerId, remoteStream);
        } else {
          createRemoteVideo(peerId, remoteStream);
        }
      },
      onConnectionStateChange: (state) => {
        console.log('[PC] Connection state for', peerId, ':', state);
        if (isConnectionFailed(state)) {
          closePeerConnection(pcsRef.current[peerId]);
          delete pcsRef.current[peerId];
          removeRemoteVideo(peerId);
        }
      }
    });

    pcsRef.current[peerId] = pc;
    return pc;
  }, []);

  const handleNewPeer = useCallback(async ({ id, name }) => {
    setMembers(prev =>
      prev.some(m => m.id === id)
        ? prev
        : [...prev, { id, name: name || "Guest" }]
    );

    const pc = createPeerConnection(id);
    
    addStreamTracks(pc, cameraStreamRef.current);
    addStreamTracks(pc, screenStreamRef.current);
    addStreamTracks(pc, localStreamRef.current);

    const offer = await createOffer(pc);
    socketRef.current?.emit('signal', {
      to: id,
      from: socketRef.current?.id,
      type: 'offer',
      data: offer
    });
  }, [createPeerConnection, cameraStreamRef, screenStreamRef, localStreamRef]);

  const handleSignal = useCallback(async ({ from, type, data }) => {
    const pc = pcsRef.current[from] || createPeerConnection(from);

    if (type === 'offer') {
      const answer = await createRtcAnswer(pc, data);
      socketRef.current?.emit('signal', {
        to: from,
        from: socketRef.current?.id,
        type: 'answer',
        data: answer
      });
    }

    if (type === 'answer') {
      await handleAnswer(pc, data);
    }

    if (type === 'ice-candidate') {
      await addIceCandidate(pc, data);
    }
  }, [createPeerConnection]);

  const handlePeerLeft = useCallback((peerId) => {
    if (pcsRef.current[peerId]) {
      closePeerConnection(pcsRef.current[peerId]);
      delete pcsRef.current[peerId];
    }
    removeRemoteVideo(peerId);
  }, []);

  const renegotiateAllPeers = useCallback(async () => {
    const peerIds = Object.keys(pcsRef.current);
    for (const peerId of peerIds) {
      try {
        const pc = pcsRef.current[peerId];
        if (!pc) continue;
        const offer = await createOffer(pc);
        socketRef.current?.emit('signal', {
          to: peerId,
          from: socketRef.current?.id,
          type: 'offer',
          data: offer
        });
        console.log('[RENEGOTIATE] Offer sent to', peerId);
      } catch (err) {
        console.warn('[RENEGOTIATE] Failed for', peerId, err);
      }
    }
  }, []);

  // ==========================================
  // CAMERA FUNCTIONS
  // ==========================================

  async function flipCamera() {
    if (availableCameras.length <= 1) {
      alert('No other cameras available to switch to.');
      return;
    }

    try {
      const { stream: newStream } = await flipCameraBase();
      localStreamRef.current = newStream;

      // Update local preview
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = newStream;
        localVideoRef.current.muted = true;
        await localVideoRef.current.play();
      }

      // Update peers - use replaceTrack
      const peerIds = Object.keys(pcsRef.current);
      for (const peerId of peerIds) {
        const pc = pcsRef.current[peerId];
        if (!pc) continue;

        const senders = pc.getSenders();
        const newVideoTrack = newStream.getVideoTracks()[0];
        const newAudioTrack = newStream.getAudioTracks()[0];

        const videoSender = senders.find(s => s.track && s.track.kind === 'video');
        if (videoSender && newVideoTrack) {
          await videoSender.replaceTrack(newVideoTrack);
        } else if (newVideoTrack) {
          pc.addTrack(newVideoTrack, newStream);
        }

        const audioSender = senders.find(s => s.track && s.track.kind === 'audio');
        if (audioSender && newAudioTrack) {
          await audioSender.replaceTrack(newAudioTrack);
        } else if (newAudioTrack) {
          pc.addTrack(newAudioTrack, newStream);
        }
      }

      console.log('[CAMERA] Camera flipped successfully');
    } catch (err) {
      console.error('[CAMERA] Flip failed:', err);
      alert('Failed to flip camera: ' + err.message);
    }
  }

  async function startCameraOnly() {
    console.log("[CAMERA] Starting camera only...");

    try {
      const cameraStream = await startCamera();

      // Update local video preview
      const videoEl = localVideoRef.current;
      if (videoEl) {
        if (isScreenSharing && screenStreamRef.current) {
          videoEl.srcObject = screenStreamRef.current;
          videoEl.muted = true;
          createLocalCameraPiP(cameraStream);
        } else {
          videoEl.srcObject = cameraStream;
          videoEl.muted = true;
          try { await videoEl.play(); } catch (e) { console.warn("[CAMERA] video play:", e); }
        }
      }

      // Attach to existing peers
      const peerIds = Object.keys(pcsRef.current);
      for (const peerId of peerIds) {
        try {
          const pc = pcsRef.current[peerId];
          if (!pc) continue;

          addStreamTracks(pc, cameraStream);

          if (isScreenSharing && screenStreamRef.current) {
            addStreamTracks(pc, screenStreamRef.current);
          }

          const offer = await createOffer(pc);
          socketRef.current?.emit("signal", {
            to: peerId,
            from: socketRef.current?.id,
            type: "offer",
            data: offer
          });
        } catch (err) {
          console.error("[CAMERA] Failed to attach to peer", peerId, err);
        }
      }

      // Handle camera stop
      const videoTrack = cameraStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          console.log("[CAMERA] Camera stopped");
          if (cameraStreamRef.current) {
            cameraStreamRef.current.getTracks().forEach(t => t.stop());
            cameraStreamRef.current = null;
          }
          setIsCameraActive(false);
          removeLocalCameraPiP();

          if (isScreenSharing && screenStreamRef.current && videoEl) {
            videoEl.srcObject = screenStreamRef.current;
          } else if (videoEl) {
            videoEl.srcObject = null;
            setIsStreaming(false);
          }
        };
      }

      console.log("[CAMERA] Camera started.");
    } catch (err) {
      console.error("[CAMERA] Error:", err);
      alert(err.message || "Failed to start camera.");
    }
  }

  async function streamVideoFile() {
    const videoEl = localVideoRef.current;
    if (!videoEl || !videoEl.src) {
      alert('Please select a video file first.');
      return;
    }

    try {
      // Start the video playback if not playing
      if (videoEl.paused) {
        await videoEl.play();
      }

      // Capture the video stream
      let videoStream = null;
      if (typeof videoEl.captureStream === 'function') {
        videoStream = videoEl.captureStream();
      } else if (typeof videoEl.mozCaptureStream === 'function') {
        videoStream = videoEl.mozCaptureStream();
      }

      if (!videoStream || videoStream.getVideoTracks().length === 0) {
        alert('Unable to capture video stream. Try playing the video first.');
        return;
      }

      const newVideoTrack = videoStream.getVideoTracks()[0];

      // If camera is active, replace only the video track, keep audio
      if (isCameraActive && localStreamRef.current) {
        console.log('[VIDEO] Replacing camera video with file video, keeping audio');
        
        // Create new stream with video file track + existing audio
        const combinedStream = new MediaStream();
        combinedStream.addTrack(newVideoTrack);
        
        // Keep existing audio tracks from camera
        const existingAudioTracks = localStreamRef.current.getAudioTracks();
        existingAudioTracks.forEach(track => combinedStream.addTrack(track));
        
        // Update local stream reference
        localStreamRef.current = combinedStream;
        setIsStreaming(true);

        // Replace video track for all peers using replaceTrack
        const peerIds = Object.keys(pcsRef.current);
        for (const peerId of peerIds) {
          const pc = pcsRef.current[peerId];
          if (!pc) continue;

          const senders = pc.getSenders();
          const videoSender = senders.find(s => s.track && s.track.kind === 'video');
          
          if (videoSender) {
            await videoSender.replaceTrack(newVideoTrack);
            console.log('[VIDEO] Replaced video track for peer', peerId);
          } else {
            // No existing video sender, add new track
            pc.addTrack(newVideoTrack, combinedStream);
            console.log('[VIDEO] Added video track for peer', peerId);
          }
        }

        console.log('[VIDEO] Video file is now streaming with camera audio');
      } else {
        // No camera active, replace everything
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(t => t.stop());
        }

        localStreamRef.current = videoStream;
        setIsStreaming(true);

        // Add to peers
        const peerIds = Object.keys(pcsRef.current);
        for (const peerId of peerIds) {
          const pc = pcsRef.current[peerId];
          videoStream.getTracks().forEach(track => {
            pc.addTrack(track, videoStream);
          });

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketRef.current?.emit('signal', {
            to: peerId,
            from: socketRef.current?.id,
            type: 'offer',
            data: offer
          });
        }

        console.log('[VIDEO] Streaming video file to peers');
      }
    } catch (err) {
      console.error('[VIDEO] Failed to stream file:', err);
      alert('Failed to stream video file: ' + err.message);
    }
  }

  // ==========================================
  // HELPER FUNCTIONS FOR LOCAL CAMERA PiP
  // ==========================================

  function createLocalCameraPiP(cameraStream) {
    const videoEl = localVideoRef.current;
    if (!videoEl) return;

    let localCameraPiP = document.getElementById("localCameraPiP");
    if (!localCameraPiP) {
      localCameraPiP = document.createElement("div");
      localCameraPiP.id = "localCameraPiP";
      localCameraPiP.style.cssText = `
        position: absolute;
        bottom: 120px;
        right: 24px;
        width: 200px;
        height: 150px;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        border: 3px solid #fff;
        z-index: 1000;
        background: #000;
      `;
      
      const pipVideo = document.createElement("video");
      pipVideo.id = "localCameraPiPVideo";
      pipVideo.autoplay = true;
      pipVideo.playsInline = true;
      pipVideo.muted = true;
      pipVideo.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
      `;
      localCameraPiP.appendChild(pipVideo);
      
      const label = document.createElement("div");
      label.textContent = "CAMERA";
      label.style.cssText = `
        position: absolute;
        top: 4px;
        left: 4px;
        background: rgba(255, 0, 0, 0.9);
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
        font-weight: bold;
        z-index: 1;
      `;
      localCameraPiP.appendChild(label);
      
      videoEl.parentElement?.appendChild(localCameraPiP);
    }
    
    const pipVideo = document.getElementById("localCameraPiPVideo");
    if (pipVideo) {
      pipVideo.srcObject = cameraStream;
    }
  }

  function removeLocalCameraPiP() {
    const localPiP = document.getElementById("localCameraPiP");
    if (localPiP) localPiP.remove();
  }

  // ==========================================
  // STOP ALL STREAMS
  // ==========================================

  function stopAllStreams() {
    console.log("[STREAM] Stopping all streams...");
    stopAllMediaStreams();
    
    // Clear local video
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    removeLocalCameraPiP();
    console.log("[STREAM] All streams stopped");
  }

  // ==========================================
  // FULLSCREEN PiP HANDLER
  // ==========================================

  useEffect(() => {
    const screen = document.getElementById("screenVideo");
    const pip = document.getElementById("cameraPiP");

    if (!screen || !pip) return;

    const handler = () => {
      pip.style.display = document.fullscreenElement ? "none" : "block";
    };

    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // ==========================================
  // DRAGGABLE PiP
  // ==========================================

  useEffect(() => {
    const pip = document.getElementById("cameraPiP");
    if (!pip) return;

    let dragging = false, ox = 0, oy = 0;

    pip.onmousedown = (e) => {
      dragging = true;
      ox = e.clientX - pip.offsetLeft;
      oy = e.clientY - pip.offsetTop;
    };

    document.onmousemove = (e) => {
      if (!dragging) return;
      pip.style.left = `${e.clientX - ox}px`;
      pip.style.top = `${e.clientY - oy}px`;
      pip.style.right = "auto";
      pip.style.bottom = "auto";
    };

    document.onmouseup = () => dragging = false;
  }, []);


  function createRemoteVideo(peerId, stream) {
    console.log('[REMOTE] Creating screen share video for', peerId);
    const container = remoteContainerRef.current;
    if (!container) return;
    
    // Check if camera PiP already exists for this peer
    const existingPip = document.getElementById(`pip_wrapper_${peerId}`);
    
    if (existingPip) {
      // Camera PiP exists, create stacked layout
      console.log('[VIDEO] Camera PiP exists, creating stacked layout with screen');
      
      // Get the camera video from the existing PiP
      const cameraVideo = existingPip.querySelector('video');
      const cameraStream = cameraVideo ? cameraVideo.srcObject : null;
      
      // Remove standalone PiP from DOM
      existingPip.remove();
      
      // Create new wrapper for stacked layout
      let wrapper = document.getElementById(`remote_wrapper_${peerId}`);
      if (wrapper) wrapper.remove();
      
      wrapper = document.createElement('div');
      wrapper.id = `remote_wrapper_${peerId}`;
      wrapper.className = "w-full max-h-[500px] relative overflow-hidden border-4 border-ink rounded-sm shadow-[6px_6px_0px_var(--color-ink)] mb-6 paper-texture";
      wrapper.style.minHeight = '300px';
      wrapper.style.backgroundColor = 'var(--color-paper)';
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'center';
      wrapper.style.justifyContent = 'center';
      
      // Create screen video element (main/background)
      const screenEl = document.createElement('video');
      screenEl.id = `remote_${peerId}`;
      screenEl.autoplay = true;
      screenEl.playsInline = true;
      screenEl.controls = true;
      screenEl.className = "w-full h-auto max-h-[500px] object-contain relative z-10";
      screenEl.style.minHeight = '0';
      screenEl.srcObject = stream;
      
      // Create camera PiP overlay (small, positioned in corner)
      const cameraPipOverlay = document.createElement('div');
      cameraPipOverlay.id = `camera_pip_overlay_${peerId}`;
      cameraPipOverlay.style.cssText = `
        position: absolute;
        bottom: 24px;
        right: 24px;
        width: 200px;
        height: 150px;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        border: 3px solid #fff;
        z-index: 20;
        background: #000;
      `;

      const cameraVideoOverlay = document.createElement('video');
      cameraVideoOverlay.autoplay = true;
      cameraVideoOverlay.playsInline = true;
      // Mute camera overlay to prevent echo - audio comes from main video controls
      cameraVideoOverlay.muted = true;
      cameraVideoOverlay.controls = false;
      cameraVideoOverlay.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
      `;
      if (cameraStream) {
        cameraVideoOverlay.srcObject = cameraStream;
      }

      // Add label
      const label = document.createElement('div');
      label.textContent = 'CAMERA';
      label.style.cssText = `
        position: absolute;
        top: 4px;
        left: 4px;
        background: rgba(255, 0, 0, 0.9);
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
        font-weight: bold;
        z-index: 1;
      `;

      cameraPipOverlay.appendChild(cameraVideoOverlay);
      cameraPipOverlay.appendChild(label);
      
      wrapper.appendChild(screenEl);
      wrapper.appendChild(cameraPipOverlay);
      container.appendChild(wrapper);
      
      console.log('[VIDEO] Stacked layout created - screen with camera overlay');
      return;
    }
    
    // No camera PiP exists, create regular screen video
    let wrapper = document.getElementById(`remote_wrapper_${peerId}`);
    if (!wrapper) {
      // Create wrapper with paper texture background
      wrapper = document.createElement('div');
      wrapper.id = `remote_wrapper_${peerId}`;
      wrapper.className = "w-full max-h-[500px] relative overflow-hidden border-4 border-ink rounded-sm shadow-[6px_6px_0px_var(--color-ink)] mb-6 paper-texture";
      wrapper.style.minHeight = '300px';
      wrapper.style.backgroundColor = 'var(--color-paper)';
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'center';
      wrapper.style.justifyContent = 'center';
      
      // Create video element
      const el = document.createElement('video');
      el.id = `remote_${peerId}`;
      el.autoplay = true;
      el.playsInline = true;
      el.controls = true;
      el.className = "w-full h-auto max-h-[500px] object-contain relative z-10";
      el.style.minHeight = '0';
      
      wrapper.appendChild(el);
      container.appendChild(wrapper);
    }
    
    const el = document.getElementById(`remote_${peerId}`);
    if (el) el.srcObject = stream;
  }

  function createCameraPiP(peerId, stream) {
    // Check if screen video already exists for this peer
    const existingScreenWrapper = document.getElementById(`remote_wrapper_${peerId}`);
    
    if (existingScreenWrapper) {
      // Screen video exists, add camera as overlay instead of standalone PiP
      console.log('[PiP] Screen exists, adding camera as overlay');
      
      // Check if camera overlay already exists
      let cameraPipOverlay = document.getElementById(`camera_pip_overlay_${peerId}`);
      if (cameraPipOverlay) {
        // Update existing camera video
        const cameraVideo = cameraPipOverlay.querySelector('video');
        if (cameraVideo) {
          cameraVideo.srcObject = stream;
        }
        console.log('[PiP] Updated existing camera overlay');
        return;
      }
      
      // Create new camera PiP overlay
      cameraPipOverlay = document.createElement('div');
      cameraPipOverlay.id = `camera_pip_overlay_${peerId}`;
      cameraPipOverlay.style.cssText = `
        position: absolute;
        bottom: 24px;
        right: 24px;
        width: 200px;
        height: 150px;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        border: 3px solid #fff;
        z-index: 20;
        background: #000;
      `;

      const cameraVideo = document.createElement('video');
      cameraVideo.autoplay = true;
      cameraVideo.playsInline = true;
      // Mute by default to prevent echo - user can unmute via controls if needed
      cameraVideo.muted = true;
      cameraVideo.controls = false;
      cameraVideo.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
      `;
      cameraVideo.srcObject = stream;

      // Add label
      const label = document.createElement('div');
      label.textContent = 'ALLY CAM';
      label.className = "font-action";
      label.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        background: var(--color-hero-red);
        color: white;
        padding: 4px 8px;
        font-size: 12px;
        font-weight: bold;
        z-index: 1;
        border-bottom: 2px solid black;
        border-right: 2px solid black;
      `;

      cameraPipOverlay.appendChild(cameraVideo);
      cameraPipOverlay.appendChild(label);
      existingScreenWrapper.appendChild(cameraPipOverlay);
      
      console.log('[PiP] Camera overlay added to existing screen video');
      return;
    }
    
    // No screen video exists, create standalone video in GRID
    // Remove existing PiP for this peer if any
    const existingWrapper = document.getElementById(`pip_wrapper_${peerId}`);
    if (existingWrapper) existingWrapper.remove();

    const container = remoteContainerRef.current;
    if (!container) {
      console.warn('[PiP] Remote container not found, cannot create video');
      return;
    }

    // Create wrapper container for Grid Item
    const wrapper = document.createElement('div');
    wrapper.id = `pip_wrapper_${peerId}`;
    // Class name doesn't matter much as we target children in RemoteGrid, but good for debugging
    wrapper.className = 'remote-camera-wrapper'; 
    // Styles will be overridden by RemoteGrid CSS, but providing defaults just in case
    wrapper.style.cssText = `
      position: relative;
      width: 100%;
      background: var(--color-paper);
      overflow: hidden;
    `;

    // Create PiP video container (inner)
    const pip = document.createElement('div');
    pip.id = `pip_${peerId}`;
    pip.className = 'camera-pip-inner';
    pip.style.cssText = `
      width: 100%;
      height: 100%;
      position: relative;
    `;

    // Create video element
    const video = document.createElement('video');
    video.id = `pip_video_${peerId}`;
    video.autoplay = true;
    video.playsInline = true;
    // Mute by default to prevent echo feedback loop - audio controlled via mic button below
    video.muted = true;
    video.srcObject = stream;
    video.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    `;

    // Create label
    const label = document.createElement('div');
    label.textContent = 'CAMERA';
    label.style.cssText = `
      position: absolute;
      top: 8px;
      left: 8px;
      background: rgba(255, 0, 0, 0.9);
      color: white;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      pointer-events: none;
      z-index: 10;
    `;

    // Create controls container (Overlay on bottom)
    const controls = document.createElement('div');
    controls.className = 'pip-controls';
    controls.style.cssText = `
      position: absolute;
      bottom: 10px;
      left: 10px;
      right: 10px;
      background: rgba(255, 255, 255, 0.9);
      border: 2px solid #2c3e50;
      border-radius: 8px;
      padding: 6px 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      z-index: 20;
    `;

    // Get audio tracks - identify microphone tracks specifically
    const audioTracks = stream.getAudioTracks();
    // Filter for mic tracks (camera stream will have mic tracks)
    const micTracks = audioTracks.filter(track => 
      track.label.toLowerCase().includes('mic') || 
      track.label.toLowerCase().includes('input') ||
      track.kind === 'audio'
    );
    // Start muted to prevent echo
    let isMuted = true;

    // Create speaker/audio button (controls video element muted state to prevent echo)
    const micBtn = document.createElement('button');
    micBtn.title = 'Toggle audio (muted by default to prevent echo)';
    micBtn.style.cssText = `
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
    `;
    // Start with muted icon since video is muted by default
    micBtn.innerHTML = '<svg class="w-6 h-6" style="fill: #c00; width: 24px; height: 24px;" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>';
    
    if (audioTracks.length > 0) {
      micBtn.onclick = (e) => {
        e.stopPropagation();
        isMuted = !isMuted;
        // Toggle the VIDEO element's muted state (this controls audio output)
        video.muted = isMuted;
        console.log('[AUDIO] Toggled camera audio, muted:', isMuted);
        micBtn.innerHTML = isMuted 
          ? '<svg class="w-6 h-6" style="fill: #c00; width: 24px; height: 24px;" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>'
          : '<svg class="w-6 h-6" style="fill: #2c3e50; width: 24px; height: 24px;" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
      };
    } else {
      micBtn.style.cursor = 'not-allowed';
      micBtn.style.opacity = '0.5';
      console.log('[AUDIO] No audio tracks found in camera stream');
    }

    // Create volume control
    const volumeContainer = document.createElement('div');
    volumeContainer.style.cssText = 'display: flex; align-items: center; gap: 4px; flex: 1; pointer-events: auto;';
    volumeContainer.innerHTML = `
      <svg class="w-5 h-5" style="fill: #2c3e50; width: 20px; height: 20px;" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
      <input type="range" min="0" max="1" step="0.1" value="1" style="flex: 1; accent-color: #2c3e50; cursor: pointer;" />
    `;
    const volumeSlider = volumeContainer.querySelector('input');
    volumeSlider.onchange = (e) => {
      video.volume = parseFloat(e.target.value);
    };

    // Create fullscreen button
    const fsBtn = document.createElement('button');
    fsBtn.title = 'Fullscreen';
    fsBtn.style.cssText = `
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
    `;
    fsBtn.innerHTML = '<svg class="w-6 h-6" style="fill: #2c3e50; width: 24px; height: 24px;" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>';
    fsBtn.onclick = (e) => {
      e.stopPropagation();
      if (!document.fullscreenElement) {
        pip.requestFullscreen().catch(err => console.warn('Fullscreen failed:', err));
      } else {
        document.exitFullscreen();
      }
    };

    // Assemble controls
    controls.appendChild(micBtn);
    controls.appendChild(volumeContainer);
    controls.appendChild(fsBtn);

    // Assemble pip
    pip.appendChild(video);
    pip.appendChild(label);
    pip.appendChild(controls); // Controls inside pip now

    // Assemble wrapper
    wrapper.appendChild(pip);
    
    // Append to GRID CONTAINER
    container.appendChild(wrapper);

    console.log('[PiP] Camera video created in grid for', peerId);
  }

  function removeRemoteVideo(peerId) {
    // Remove regular remote video wrapper
    const wrapper = document.getElementById(`remote_wrapper_${peerId}`);
    if (wrapper && wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
    
    // Fallback: remove old-style video element if exists
    const el = document.getElementById(`remote_${peerId}`);
    if (el && el.parentNode) el.parentNode.removeChild(el);
    
    // Remove camera PiP wrapper if exists
    const pipWrapper = document.getElementById(`pip_wrapper_${peerId}`);
    if (pipWrapper && pipWrapper.parentNode) pipWrapper.parentNode.removeChild(pipWrapper);
  }

  // Duplicate legacy createPeerConnection removed — use the modularized
  // `createPeerConnection` defined earlier (useCallback) which wraps
  // `lib/rtc.createPeerConnection` and centralizes RTC behavior.

function joinRoom() {
  if (joined) return;   // ← PREVENT DOUBLE JOIN
  setJoined(true);
  socketRef.current?.emit("join-room", { roomId, displayName });
}

  function leaveRoom() {
    console.log('[LEAVE] leaveRoom() called - emitting leave-room event');
    // close pcs
    Object.keys(pcsRef.current).forEach(id => {
      try { pcsRef.current[id].close(); } catch {}
      removeRemoteVideo(id);
    });
    pcsRef.current = {};
    // stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    // Stop screen share if active
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    // Stop camera if active
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
    }
    // Stop mic track
    if (micTrackRef.current) {
      micTrackRef.current.stop();
      micTrackRef.current = null;
    }
    // Reset all states
    setIsStreaming(false);
    setIsScreenSharing(false);
    setIsCameraActive(false);
    setJoined(false);
    setMembers([]);
    
    // Emit leave-room to server (keeps socket connected for immediate rejoin)
    if (socketRef.current && roomId) {
      console.log('[LEAVE] Emitting leave-room for room:', roomId);
      socketRef.current.emit('leave-room', { roomId });
    }
    // Refresh the page shortly after leaving to ensure host UI state is cleared
    try {
      setTimeout(() => {
        console.log('[LEAVE] Reloading page to clear UI state');
        window.location.reload();
      }, 250);
    } catch (e) {
      console.warn('Failed to reload page automatically', e);
    }
  }

  function handleFileSelected(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const v = localVideoRef.current;
    v.src = url;
    v.load();
  }

 // Replace your existing startStreaming() with this:
async function startStreaming() {
  const videoEl = localVideoRef.current;
  if (!videoEl) return alert('Load a file first.');

  console.log('[STREAM] startStreaming() called — attempting to play video and capture stream');

  // 1) Ensure video is playing (user gesture required). Try to play; wait for 'playing' event.
  try {
    await videoEl.play();
  } catch (err) {
    console.warn('[STREAM] play() may be blocked until user interacts:', err);
  }

  // Wait until the video actually reports playing or readyState is good
  await new Promise((resolve) => {
    if (!videoEl.paused && videoEl.readyState >= 3) return resolve();
    const onplaying = () => {
      videoEl.removeEventListener('playing', onplaying);
      resolve();
    };
    videoEl.addEventListener('playing', onplaying);
    // safety timeout in case event doesn't fire
    setTimeout(() => {
      try { videoEl.removeEventListener('playing', onplaying); } catch {}
      resolve();
    }, 2000);
  });

  console.log('[STREAM] video playing state:', { paused: videoEl.paused, readyState: videoEl.readyState, videoWidth: videoEl.videoWidth, videoHeight: videoEl.videoHeight });

  

  // 2) Try captureStream()
  let stream = null;
  try {
    if (typeof videoEl.captureStream === 'function') {
      stream = videoEl.captureStream();
    } else if (typeof videoEl.mozCaptureStream === 'function') {
      stream = videoEl.mozCaptureStream();
    } else {
      console.warn('[STREAM] captureStream API not supported in this browser');
    }
  } catch (err) {
    console.warn('[STREAM] captureStream() threw:', err);
    stream = null;
  }

  // 3) Validate captured stream (ensure it has tracks)
  const hasTracks = stream && stream.getVideoTracks && stream.getVideoTracks().length > 0;
  if (!hasTracks) {
    console.warn('[STREAM] captureStream returned no tracks — falling back to canvas capture');
    // fallback: draw video into canvas and capture from canvas (lower resolution)
    const canvas = document.createElement('canvas');
    const w = videoEl.videoWidth || 640;
    const h = videoEl.videoHeight || 360;
    // downscale to reduce bandwidth and improve reliability
    const targetW = Math.min(w, 960);
    const targetH = Math.min(h, Math.round(targetW * (h / w) || 0.5625));
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');

    // draw loop
    let rafId = null;
    let drawActive = true;
    const drawFrame = () => {
      if (!drawActive) return;
      try { ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height); } catch (e) { /* sometimes while loading */ }
      rafId = requestAnimationFrame(drawFrame);
    };
    drawFrame();

    // capture from canvas at 15fps (lower CPU/bandwidth)
    stream = canvas.captureStream ? canvas.captureStream(15) : null;
    if (!stream) {
      // last resort: try getDisplayMedia (requires permission and shares the screen)
      console.warn('[STREAM] canvas.captureStream not available — trying getDisplayMedia as last resort');
      try {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      } catch (err) {
        console.error('[STREAM] getDisplayMedia fallback failed:', err);
        return alert('Unable to capture the video. Try Chrome/Edge and ensure playback started.');
      }
    }

    // when stopping streaming, cancel this draw loop cleanup
    stream._canvasFallback = { canvas, stop: () => { drawActive = false; if (rafId) cancelAnimationFrame(rafId); } };
  }

  // 4) Attach local stream to ref and mark streaming
  localStreamRef.current = stream;
  setIsStreaming(true);
  console.log('[STREAM] obtained local stream — tracks:', stream.getTracks().map(t => `${t.kind}:${t.id}`));

  // 5) Add tracks to existing peer connections and renegotiate (offer)
  const peerIds = Object.keys(pcsRef.current);
  for (const peerId of peerIds) {
    try {
      const pc = pcsRef.current[peerId];
      // add tracks if not already present
      const senders = pc.getSenders ? pc.getSenders() : [];
      if (!senders.some(s => s.track && s.track.kind === 'video')) {
        stream.getTracks().forEach(track => {
          try { pc.addTrack(track, stream); } catch (e) { console.warn(`[STREAM] addTrack failed for ${peerId}`, e); }
        });
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current?.emit('signal', { to: peerId, from: socketRef.current?.id, type: 'offer', data: offer });
        console.log('[STREAM] renegotiation offer sent to', peerId);
      }
    } catch (err) {
      console.error('[STREAM] failed to add tracks / renegotiate for', peerId, err);
    }
  }

  console.log('[STREAM] streaming started.');
}

async function startScreenShareWithMic() {
  console.log("[SCREEN] Requesting screen share...");

  const includeMic = confirm(
    "Do you want to include your MICROPHONE for commentary?\n\n" +
    "⚠️ IMPORTANT: To prevent echo:\n" +
    "• Use HEADPHONES (recommended)\n" +
    "• OR keep your speakers MUTED\n" +
    "• Otherwise your mic will pick up system audio creating echo\n\n" +
    "Click OK to add mic, or Cancel for system audio only."
  );

  try {
    const { finalStream, screenStream } = await startScreenShare({ includeMic });

    // Show local preview
    const videoEl = localVideoRef.current;
    if (videoEl) {
      if (isCameraActive && cameraStreamRef.current) {
        console.log("[SCREEN] Camera already active - creating stacked layout");
        videoEl.srcObject = finalStream;
        videoEl.muted = true;
        videoEl.volume = 0;
        try { await videoEl.play(); } catch {}
        createLocalCameraPiP(cameraStreamRef.current);
      } else {
        videoEl.srcObject = finalStream;
        videoEl.muted = true;
        videoEl.volume = 0;
        try { await videoEl.play(); } catch {}
      }
    }

    // Add screen tracks to all peers
    const peerIds = Object.keys(pcsRef.current);
    for (const peerId of peerIds) {
      const pc = pcsRef.current[peerId];
      addStreamTracks(pc, finalStream);

      if (isCameraActive && cameraStreamRef.current) {
        addStreamTracks(pc, cameraStreamRef.current);
      }

      const offer = await createOffer(pc);
      socketRef.current?.emit("signal", {
        to: peerId,
        from: socketRef.current?.id,
        type: "offer",
        data: offer
      });
    }

    // Handle user manually stopping screen share
    screenStream.getVideoTracks()[0].onended = () => {
      console.log("[SCREEN] Screen share manually stopped");
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
      removeLocalCameraPiP();

      if (isCameraActive && cameraStreamRef.current && videoEl) {
        videoEl.srcObject = cameraStreamRef.current;
      } else if (videoEl) {
        videoEl.srcObject = null;
        setIsStreaming(false);
      }
    };

    console.log("[SCREEN] Screen sharing started.");
  } catch (err) {
    console.error("[SCREEN] Screen share failed:", err);
    alert(err.message || "Screen sharing failed.");
  }
}

  // ==========================================
  // VIDEO CONTROL HELPERS
  // ==========================================

  const handleVideoTimeUpdate = () => {
    if (localVideoRef.current) {
      setCurrentTime(localVideoRef.current.currentTime);
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (localVideoRef.current) {
      setDuration(localVideoRef.current.duration);
      setVolume(localVideoRef.current.volume);
    }
  };

  const togglePlay = () => {
    if (localVideoRef.current) {
      if (localVideoRef.current.paused) {
        localVideoRef.current.play().catch(() => {});
        setIsPlaying(true);
        
        // Emit play event to sync receivers
        if (socketRef.current && isStreaming) {
          socketRef.current.emit('video-play', { roomId });
          console.log('[SYNC] Sent play event to receivers');
        }
      } else {
        localVideoRef.current.pause();
        setIsPlaying(false);
        
        // Emit pause event to sync receivers
        if (socketRef.current && isStreaming) {
          socketRef.current.emit('video-pause', { roomId });
          console.log('[SYNC] Sent pause event to receivers');
        }
      }
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (localVideoRef.current) {
      localVideoRef.current.currentTime = time;
      setCurrentTime(time);
      
      // Emit seek event to sync all receivers
      if (socketRef.current && isStreaming) {
        socketRef.current.emit('video-seek', { time, roomId });
        console.log('[SYNC] Sent seek event to receivers:', time);
      }
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    if (localVideoRef.current) {
      localVideoRef.current.volume = vol;
      setVolume(vol);
    }
  };

  const toggleFullscreen = () => {
    if (localVideoRef.current) {
      if (!document.fullscreenElement) {
        localVideoRef.current.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen();
      }
    }
  };

  const handleToggleMic = async () => {
    try {
      const enabled = await toggleMic();
      
      // Add mic to existing peer connections if new mic was added
      if (enabled && micTrackRef.current) {
        Object.keys(pcsRef.current).forEach(peerId => {
          try { 
            pcsRef.current[peerId].addTrack(micTrackRef.current, localStreamRef.current); 
          } catch (e) { 
            console.warn('pc.addTrack mic failed', e); 
          }
        });
        
        // Renegotiate
        await renegotiateAllPeers();
      }
    } catch (err) {
      console.error('[MIC] toggle error', err);
      alert('Microphone access denied or unavailable.');
    }
  };

  // ==========================================
  // 🎨 COMIC INTERACTIVE EFFECTS
  // ==========================================

  if (!token) {
    if (authView === 'landing') {
      return (
        <LandingPage 
          onGetStarted={() => setAuthView('signup')} 
          onLogin={() => setAuthView('login')} 
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-paper)] relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(var(--color-ink) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
        
        <div className="relative z-10 w-full">
          {authView === 'signup' ? (
            <RegisterForm onSwitch={() => setAuthView('login')} />
          ) : (
            <LoginForm onSwitch={() => setAuthView('signup')} />
          )}
        </div>

        <button 
          onClick={() => setAuthView('landing')}
          className="fixed top-6 left-6 font-display font-bold text-ink hover:text-hero-blue transition-colors z-50 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 border-2 border-ink rounded-lg shadow-[4px_4px_0px_var(--color-ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_var(--color-ink)]"
        >
          <span className="text-xl">←</span> BACK TO HOME
        </button>
      </div>
    );
  }

  return (
    <>
    <Snowfall style={{ position: 'fixed', inset: 0, zIndex:9999999, pointerEvents: 'none' }} snowflakeCount={100} color="#ffffff"/>
    <div className="min-h-screen p-8 md:p-12 flex flex-col gap-12 relative overflow-hidden">
      {/* Watercolor background effects */}
      <div className="watercolor-wash w-[800px] h-[800px] -top-40 -left-40 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 fixed"></div>
      <div className="watercolor-wash w-[600px] h-[600px] top-20 right-0 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 fixed"></div>
      <div className="watercolor-wash w-[500px] h-[500px] bottom-0 left-20 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 fixed"></div>

      {/* Header Section */}
      <Header
        isStreaming={isStreaming}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        members={members}
      />

      {/* Main Content Grid */}
      <main className="w-full max-w-6xl mx-auto flex flex-col gap-12 relative z-10">
        
        {/* Top Row: Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Connection Panel */}
          <JoinPanel
            roomId={roomId}
            setRoomId={setRoomId}
            displayName={displayName}
            setDisplayName={setDisplayName}
            joined={joined}
            onJoin={joinRoom}
            onLeave={leaveRoom}
          />

          {/* Mobile-only Members Panel - Always visible on small screens */}
          <MembersPanelMobile members={members} currentUserId={socketRef.current?.id} />

          {/* Media Controls Panel */}
          <StreamControls
            onFileSelected={handleFileSelected}
            onStartStreaming={startStreaming}
            onStartScreenShare={startScreenShareWithMic}
            onStartCamera={startCameraOnly}
            onFlipCamera={flipCamera}
            onStopAllStreams={stopAllStreams}
            isStreaming={isStreaming}
            isScreenSharing={isScreenSharing}
            isCameraActive={isCameraActive}
            availableCameras={availableCameras}
          />
        </div>

        {/* Bottom Row: Video Feeds */}
        <div className="flex flex-col gap-8">
          {/* Remote Videos Grid */}
          <RemoteGrid ref={remoteContainerRef} />

          {/* Local Video (Host) */}
          <LocalPlayer
            ref={localVideoRef}
            isStreaming={isStreaming}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            micEnabled={micEnabled}
            onTimeUpdate={handleVideoTimeUpdate}
            onLoadedMetadata={handleVideoLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTogglePlay={togglePlay}
            onSeek={handleSeek}
            onVolumeChange={handleVolumeChange}
            onToggleMic={handleToggleMic}
            onToggleFullscreen={toggleFullscreen}
          />
        </div>

      </main>

      {/* Footer */}
      <Footer />
    </div>
    </>
  );
}

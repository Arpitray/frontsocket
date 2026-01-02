'use client';
import { useRef, useCallback } from 'react';
import { 
  createPeerConnection, 
  createOffer, 
  createAnswer, 
  handleAnswer, 
  addIceCandidate,
  addStreamTracks,
  replaceTrack,
  closePeerConnection,
  isConnectionFailed,
  getStreamType
} from '../lib/rtc';

/**
 * Custom hook to manage WebRTC peer connections
 * Handles signaling, track management, and peer lifecycle
 */
export function usePeerConnections({
  socketRef,
  cameraStreamRef,
  screenStreamRef,
  localStreamRef,
  onRemoteStream,
  onCameraStream,
  onPeerDisconnected
}) {
  const pcsRef = useRef({});

  /**
   * Create a peer connection for a specific peer
   */
  const createPeer = useCallback((peerId, willSendTracks = false) => {
    if (pcsRef.current[peerId]) return pcsRef.current[peerId];

    const remoteStream = new MediaStream();

    const pc = createPeerConnection({
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

        // Add all tracks to remoteStream
        ev.streams?.forEach(s => {
          s.getTracks().forEach(t => {
            if (!remoteStream.getTracks().find(existing => existing.id === t.id)) {
              remoteStream.addTrack(t);
            }
          });
        });

        // Determine stream type and call appropriate handler
        const streamId = ev.streams?.[0]?.id || '';
        const streamType = getStreamType(streamId);

        console.log('[TRACK] Stream ID:', streamId, 'Type:', streamType);

        if (streamType === 'camera') {
          onCameraStream?.(peerId, remoteStream);
        } else {
          onRemoteStream?.(peerId, remoteStream);
        }
      },
      onConnectionStateChange: (state) => {
        console.log('[PC] Connection state for', peerId, ':', state);
        if (isConnectionFailed(state)) {
          closePeerConnection(pcsRef.current[peerId]);
          delete pcsRef.current[peerId];
          onPeerDisconnected?.(peerId);
        }
      }
    });

    pcsRef.current[peerId] = pc;
    return pc;
  }, [socketRef, onRemoteStream, onCameraStream, onPeerDisconnected]);

  /**
   * Handle a new peer joining - create connection and send offer
   */
  const handleNewPeer = useCallback(async (peerId) => {
    const pc = createPeer(peerId, true);

    // Add all available streams
    addStreamTracks(pc, cameraStreamRef.current);
    addStreamTracks(pc, screenStreamRef.current);
    addStreamTracks(pc, localStreamRef.current);

    // Create and send offer
    const offer = await createOffer(pc);
    socketRef.current?.emit('signal', {
      to: peerId,
      from: socketRef.current?.id,
      type: 'offer',
      data: offer
    });

    console.log('[PC] Sent offer to', peerId);
    return pc;
  }, [createPeer, socketRef, cameraStreamRef, screenStreamRef, localStreamRef]);

  /**
   * Handle incoming signal (offer, answer, ice-candidate)
   */
  const handleSignal = useCallback(async ({ from, type, data }) => {
    const pc = pcsRef.current[from] || createPeer(from);

    if (type === 'offer') {
      const answer = await createAnswer(pc, data);
      socketRef.current?.emit('signal', {
        to: from,
        from: socketRef.current?.id,
        type: 'answer',
        data: answer
      });
      console.log('[PC] Sent answer to', from);
    }

    if (type === 'answer') {
      await handleAnswer(pc, data);
      console.log('[PC] Received answer from', from);
    }

    if (type === 'ice-candidate') {
      await addIceCandidate(pc, data);
    }
  }, [createPeer, socketRef]);

  /**
   * Handle peer leaving - cleanup connection
   */
  const handlePeerLeft = useCallback((peerId) => {
    if (pcsRef.current[peerId]) {
      closePeerConnection(pcsRef.current[peerId]);
      delete pcsRef.current[peerId];
    }
    onPeerDisconnected?.(peerId);
  }, [onPeerDisconnected]);

  /**
   * Add tracks to all existing peer connections
   */
  const addTracksToAllPeers = useCallback((stream) => {
    if (!stream) return;

    Object.keys(pcsRef.current).forEach(peerId => {
      const pc = pcsRef.current[peerId];
      if (pc) {
        addStreamTracks(pc, stream);
      }
    });
  }, []);

  /**
   * Replace a track for all peers
   */
  const replaceTrackForAllPeers = useCallback(async (kind, newTrack) => {
    const peerIds = Object.keys(pcsRef.current);
    
    for (const peerId of peerIds) {
      const pc = pcsRef.current[peerId];
      if (pc) {
        await replaceTrack(pc, kind, newTrack);
      }
    }
  }, []);

  /**
   * Renegotiate with all peers (send new offers)
   */
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
  }, [socketRef]);

  /**
   * Close all peer connections
   */
  const closeAllConnections = useCallback(() => {
    Object.keys(pcsRef.current).forEach(peerId => {
      closePeerConnection(pcsRef.current[peerId]);
      onPeerDisconnected?.(peerId);
    });
    pcsRef.current = {};
  }, [onPeerDisconnected]);

  /**
   * Get all connected peer IDs
   */
  const getConnectedPeerIds = useCallback(() => {
    return Object.keys(pcsRef.current);
  }, []);

  /**
   * Get a specific peer connection
   */
  const getPeerConnection = useCallback((peerId) => {
    return pcsRef.current[peerId];
  }, []);

  return {
    pcsRef,
    createPeer,
    handleNewPeer,
    handleSignal,
    handlePeerLeft,
    addTracksToAllPeers,
    replaceTrackForAllPeers,
    renegotiateAllPeers,
    closeAllConnections,
    getConnectedPeerIds,
    getPeerConnection
  };
}

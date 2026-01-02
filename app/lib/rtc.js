'use client';
import { STUN_SERVERS } from './config';

/**
 * Create a new RTCPeerConnection with standard configuration
 * @param {Object} options - Configuration options
 * @param {Function} options.onIceCandidate - Callback for ICE candidates
 * @param {Function} options.onTrack - Callback for incoming tracks
 * @param {Function} options.onConnectionStateChange - Callback for connection state changes
 * @returns {RTCPeerConnection}
 */
export function createPeerConnection(options = {}) {
  const { onIceCandidate, onTrack, onConnectionStateChange } = options;
  
  const pc = new RTCPeerConnection(STUN_SERVERS);

  if (onIceCandidate) {
    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        onIceCandidate(ev.candidate);
      }
    };
  }

  if (onTrack) {
    pc.ontrack = onTrack;
  }

  if (onConnectionStateChange) {
    pc.onconnectionstatechange = () => {
      onConnectionStateChange(pc.connectionState);
    };
  }

  return pc;
}

/**
 * Create an offer for a peer connection
 * @param {RTCPeerConnection} pc - The peer connection
 * @returns {Promise<RTCSessionDescriptionInit>}
 */
export async function createOffer(pc) {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  return offer;
}

/**
 * Create an answer for a peer connection
 * @param {RTCPeerConnection} pc - The peer connection
 * @param {RTCSessionDescriptionInit} offer - The offer to answer
 * @returns {Promise<RTCSessionDescriptionInit>}
 */
export async function createAnswer(pc, offer) {
  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  return answer;
}

/**
 * Handle an incoming answer
 * @param {RTCPeerConnection} pc - The peer connection
 * @param {RTCSessionDescriptionInit} answer - The answer to handle
 */
export async function handleAnswer(pc, answer) {
  await pc.setRemoteDescription(new RTCSessionDescription(answer));
}

/**
 * Add an ICE candidate to a peer connection
 * @param {RTCPeerConnection} pc - The peer connection
 * @param {RTCIceCandidateInit} candidate - The ICE candidate
 */
export async function addIceCandidate(pc, candidate) {
  await pc.addIceCandidate(new RTCIceCandidate(candidate));
}

/**
 * Add tracks from a stream to a peer connection
 * @param {RTCPeerConnection} pc - The peer connection
 * @param {MediaStream} stream - The stream to add tracks from
 * @param {boolean} checkDuplicates - Whether to check for duplicate tracks
 */
export function addStreamTracks(pc, stream, checkDuplicates = true) {
  if (!stream) return;

  stream.getTracks().forEach(track => {
    try {
      if (checkDuplicates) {
        const senders = pc.getSenders();
        const existingSender = senders.find(s => s.track && s.track.id === track.id);
        if (existingSender) {
          console.log('[RTC] Track already exists, skipping:', track.kind);
          return;
        }
      }
      pc.addTrack(track, stream);
      console.log('[RTC] Added track:', track.kind);
    } catch (err) {
      console.warn('[RTC] addTrack failed:', err);
    }
  });
}

/**
 * Replace a track in a peer connection
 * @param {RTCPeerConnection} pc - The peer connection
 * @param {string} kind - The kind of track to replace ('audio' or 'video')
 * @param {MediaStreamTrack} newTrack - The new track
 */
export async function replaceTrack(pc, kind, newTrack) {
  const senders = pc.getSenders();
  const sender = senders.find(s => s.track && s.track.kind === kind);
  
  if (sender) {
    await sender.replaceTrack(newTrack);
    console.log('[RTC] Replaced', kind, 'track');
    return true;
  }
  return false;
}

/**
 * Close a peer connection and cleanup
 * @param {RTCPeerConnection} pc - The peer connection to close
 */
export function closePeerConnection(pc) {
  if (!pc) return;
  
  try {
    // Stop all transceivers
    pc.getTransceivers?.().forEach(transceiver => {
      transceiver.stop?.();
    });
    
    // Close the connection
    pc.close();
  } catch (err) {
    console.warn('[RTC] Error closing peer connection:', err);
  }
}

/**
 * Check if a connection state is considered failed/disconnected
 * @param {RTCPeerConnectionState} state - The connection state
 * @returns {boolean}
 */
export function isConnectionFailed(state) {
  return ['failed', 'closed', 'disconnected'].includes(state);
}

/**
 * Get the stream type from a stream ID
 * @param {string} streamId - The stream ID
 * @returns {'camera' | 'screen' | 'unknown'}
 */
export function getStreamType(streamId) {
  if (!streamId) return 'unknown';
  if (streamId.includes('camera')) return 'camera';
  if (streamId.includes('screen')) return 'screen';
  return 'unknown';
}

/**
 * Create a MediaStream and collect tracks from multiple sources
 * @param {MediaStream[]} streams - Array of streams to combine
 * @returns {MediaStream}
 */
export function combineStreams(...streams) {
  const combined = new MediaStream();
  
  streams.forEach(stream => {
    if (stream) {
      stream.getTracks().forEach(track => {
        if (!combined.getTracks().find(t => t.id === track.id)) {
          combined.addTrack(track);
        }
      });
    }
  });
  
  return combined;
}

"use client"

import { useState, useEffect, useRef } from "react"

const SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition)

export function useVoiceTyping(options = {}) {
  const { continuous = false, interimResults = true, lang = "bn-BD" } = options

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState(null)

  const recognitionRef = useRef(null)

  useEffect(() => {
    if (!SpeechRecognition) {
      setError("Web Speech API is not supported in this browser.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.lang = lang

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event) => {
      let currentTranscript = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          currentTranscript += transcriptSegment
        }
      }
      setTranscript((prev) => (prev ? prev + " " + currentTranscript : currentTranscript))
    }

    recognition.onerror = (event) => {
      setError(event.error)
      setIsListening(false)
      console.error("Speech recognition error:", event.error)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [continuous, interimResults, lang])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
      } catch (e) {
        console.error("Error starting speech recognition:", e)
        setError("Error starting speech recognition. Is it already running?")
        setIsListening(false)
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const resetTranscript = () => {
    setTranscript("")
  }

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
    browserSupportsSpeechRecognition: !!SpeechRecognition,
  }
}

"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useVoiceTyping } from "@/hooks/useVoiceTyping"
import { Mic, MicOff } from "lucide-react"
import { toast } from "sonner"

export function VoiceTypingButton({
  fieldName,
  setValue,
  currentValue = "",
  placeholder = "এই ফিল্ড",
  language = "bn-BD",
  continuous = false,
  interimResults = true,
}) {
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    error,
    browserSupportsSpeechRecognition,
  } = useVoiceTyping({
    lang: language,
    continuous,
    interimResults,
  })

  React.useEffect(() => {
    if (transcript) {
      setValue(fieldName, transcript, { shouldValidate: true })
    }
  }, [transcript, fieldName, setValue])

  const handleToggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      resetTranscript()
      if (currentValue) {
        setTimeout(() => {
          setValue(fieldName, currentValue, { shouldValidate: true })
        }, 0)
      }
      startListening()
      toast.info("🎤 ভয়েস টাইপিং শুরু হয়েছে", {
        description: `এখন বাংলায় ${placeholder} বলুন...`,
        duration: 2000,
      })
    }
  }

  React.useEffect(() => {
    if (error) {
      toast.error("ভয়েস টাইপিং ত্রুটি", {
        description: "অনুগ্রহ করে আবার চেষ্টা করুন",
      })
    }
  }, [error])

  if (!browserSupportsSpeechRecognition) {
    return null
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleToggleListening}
            className={`
              relative h-7 w-7 p-0 rounded-full transition-all duration-300
              ${
                isListening
                  ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50 scale-105"
                  : "bg-green-500 hover:bg-green-600 text-white hover:scale-105 shadow-md hover:shadow-lg hover:shadow-green-500/50"
              }
            `}
          >
            {isListening ? (
              <>
                <MicOff className="h-3.5 w-3.5 animate-pulse" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              </>
            ) : (
              <Mic className="h-3.5 w-3.5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-green-600 text-white border-none">
          <p className="font-medium">
            {isListening ? "🔴 রেকর্ডিং চলছে - বন্ধ করতে ক্লিক করুন" : "🎤 ভয়েস টাইপিং শুরু করুন"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
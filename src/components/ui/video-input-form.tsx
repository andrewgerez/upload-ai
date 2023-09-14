import { FileVideo, Upload } from "lucide-react"
import { Separator } from "./separator"
import { Label } from "./label"
import { Textarea } from "./textarea"
import { Button } from "./button"
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react"
import { getFFmpeg } from "@/lib/ffmpeg"
import { fetchFile } from "@ffmpeg/util"
import { api } from "@/lib/axios"

export const VideoInputForm = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const promptInputRef = useRef<HTMLTextAreaElement>(null)

  const handleFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.currentTarget

    if (!files) {
      return
    }

    const selectedFile = files[0]

    setVideoFile(selectedFile)
  }

  const convertVideoToAudio = async (video: File) => {
    console.log('convert started')

    const ffmpeg = await getFFmpeg()

    await ffmpeg.writeFile('input.mp4', await fetchFile(video))

    // ffmpeg.on('log', log => {
    //   console.log(log)
    // })

    ffmpeg.on('progress', progress => {
      console.log('Convert progress: ' + Math.round(progress.progress * 100))
    })

    await ffmpeg.exec([
      '-i',
      'input.mp4',
      '-map',
      '0:a',
      '-b:a',
      '20k',
      '-acodec',
      'libmp3lame',
      'output.mp3'
    ])

    const data = await ffmpeg.readFile('output.mp3')

    const audioFileBlob = new Blob([data], { type: 'audio/mpeg' })
    const audioFile = new File([audioFileBlob], 'audio.mp3', {
      type: 'audio/mpeg',
    })

    console.log('Convert finished.')

    return audioFile
  }

  const handleUploadVideo = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const prompt = promptInputRef.current?.value

    if (!videoFile) {
      return
    }

    const audioFile = await convertVideoToAudio(videoFile)

    const data = new FormData()

    data.append('file', audioFile)

    const response = await api.post('/videos', data)

    const videoId = response.data.video.id

    await api.post(`/videos/${videoId}/transcription`, {
      prompt,
    })

    console.log('finished.')
  }

  const previewURL = useMemo(() => {
    if (!videoFile) {
      return null
    }

    return URL.createObjectURL(videoFile)
  }, [videoFile])

  return (
    <form onSubmit={handleUploadVideo} className="space-y-6">
      <label 
        htmlFor="video"
        className="relative border 
          flex rounded-md aspect-video cursor-pointer 
          border-dashed text-sm flex-col gap-2 items-center 
          justify-center text-muted-foreground overflow-hidden
          hover:bg-primary/5"
      >
        {previewURL ? (
          <video src={previewURL} controls={false} className="pointer-events-none absolute inset-0" />
        ) : (
          <>
            <FileVideo className="w-4 h-4" />
            Selecione um video      
          </>
        )}
      </label>

      <input 
        type="file" 
        id="video" 
        accept="video/mp4" 
        className="sr-only"
        onChange={handleFileSelected}
      />

      <Separator />

      <div className="space-y-2">
        <Label 
          htmlFor="transcription_prompt"
        >
          Prompt de transcrição
        </Label>

        <Textarea
          ref={promptInputRef}
          id="transcription_prompt"
          className="h-20 leading-relaxed resize-none"
          placeholder="Inclua palavras-chave mencionadas no video separadas por vírgula (,)"
        />
      </div>

      <Button type="submit" className="w-full">
        Carregar video
        <Upload className="w-4 h-4 ml-2" />
      </Button>
    </form>
  )
}
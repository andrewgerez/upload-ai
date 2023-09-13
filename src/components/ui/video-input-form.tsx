import { FileVideo, Upload } from "lucide-react"
import { Separator } from "./separator"
import { Label } from "./label"
import { Textarea } from "./textarea"
import { Button } from "./button"
import { ChangeEvent, FormEvent, useMemo, useState } from "react"

export const VideoInputForm = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null)

  const handleFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.currentTarget

    if (!files) {
      return
    }

    const selectedFile = files[0]

    setVideoFile(selectedFile)
  }

  const previewURL = useMemo(() => {
    if (!videoFile) {
      return null
    }

    return URL.createObjectURL(videoFile)
  }, [videoFile])

  return (
    <form className="space-y-6">
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
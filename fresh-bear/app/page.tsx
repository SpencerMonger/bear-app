"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, BeakerIcon as Bear } from "lucide-react"
import axios from "axios"

export default function BearClassifier() {
  const [file, setFile] = useState<File | null>(null)
  const [prediction, setPrediction] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await axios.post("http://localhost:8000/classify", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      setPrediction(res.data)
    } catch (err: any) {
      console.error("Error:", err)
      setPrediction({ error: err.response?.data?.detail || "An error occurred" })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background dark flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-4xl font-bold flex items-center justify-center gap-2">
            <Bear className="h-8 w-8" />
            Bear Classifier
          </CardTitle>
          <p className="text-muted-foreground">Upload an image to identify different types of bears</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center justify-center">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center hover:border-muted-foreground/50 transition-colors"
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <span className="mt-2 block text-sm font-semibold text-muted-foreground">
                  Choose an image or drag and drop
                </span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={!file || loading} size="lg">
              {loading ? "Analyzing..." : "Classify Bear"}
            </Button>
          </form>

          {preview && (
            <div className="space-y-4">
              {prediction && !prediction.error && (
                <Card className="bg-card/50">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Result</h3>
                        <span className="text-xl font-bold text-primary">{prediction.prediction}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Confidence</span>
                          <span className="font-medium">{(prediction.confidence * 100).toFixed(2)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500 ease-in-out"
                            style={{ width: `${prediction.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                      {prediction.details && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">All Probabilities</h4>
                          <div className="space-y-1">
                            {Object.entries(prediction.details).map(([label, prob]: [string, any]) => (
                              <div key={label} className="flex justify-between text-sm">
                                <span>{label}</span>
                                <span className="font-medium">{(prob * 100).toFixed(2)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="aspect-square relative rounded-lg overflow-hidden border border-border">
                <img
                  src={prediction ? prediction.image : preview}
                  alt="Selected"
                  className="object-cover w-full h-full"
                />
              </div>

              {prediction?.error && (
                <div className="p-4 rounded-lg bg-destructive/10 text-destructive">Error: {prediction.error}</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


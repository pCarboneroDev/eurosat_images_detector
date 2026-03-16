import './Detector.css'
import { useReducer } from 'react'
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Upload, Image as ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react"
import { detectorReducer, getInitialState } from '../reducer/detectorReducer'
import { call } from '@/service/api'
import { classColors } from '@/utils/classColors'


function App() {
  const [state, dispatch] = useReducer(detectorReducer, getInitialState());

  const {
    selectedFile,
    previewUrl,
    isLoading,
    response,
    error
  } = state;


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      dispatch({ type: 'SET_FILE', payload: file })
    }
  }

  const handleUpload = async () => {
    try {
      const res = await call(selectedFile!)
      dispatch({ type: 'UPLOAD_FILE'})

      if (res) {
        dispatch({ type: 'UPLOAD_SUCCESS', payload: res })
      } else {
        dispatch({ type: 'UPLOAD_ERROR', payload: 'Error al procesar la imagen' })
      }
    } catch (err) {
      dispatch({ type: 'UPLOAD_ERROR', payload: 'Error al conectar con el servidor' })
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.9) return 'text-green-600'
    if (confidence > 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatClassName = (name: string) => {
    return name.replace(/([A-Z])/g, ' $1').trim()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Satellite Images Detector
          </h1>
          <p className="text-gray-600 mt-2">
            Clasify satellital images using Deep Learning
          </p>
        </div>

        <Separator className="my-6" />

        {/* Main Card */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Upload your satellite image
            </CardTitle>
            <CardDescription>
              Format supported: JPG, PNG, JPEG (max. 10MB)
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Upload Area */}
            <Field>
              <FieldLabel htmlFor="picture" className="text-lg">
                Picture
              </FieldLabel>
              <div className="flex items-center gap-4">
                <Input
                  id="picture"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
              <FieldDescription>
                {selectedFile
                  ? `File selected: ${selectedFile.name}`
                  : 'Select a satellite image to analyze'
                }
              </FieldDescription>
            </Field>

            {/* Preview */}
            {previewUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain bg-gray-100"
                  />
                </div>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Results */}
            {response && response.success && (
              <div className="mt-6 space-y-6">
                <Alert className="border-green-500 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-600">
                    Analysis Completed!
                  </AlertTitle>
                  <AlertDescription>
                    Processed image: {response.filename}
                  </AlertDescription>
                </Alert>

                {/* Main Prediction */}
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Badge
                        className={`${classColors[response.prediction.class_name] || 'bg-gray-500'
                          } text-white mb-3 text-lg px-4 py-1`}
                      >
                        {formatClassName(response.prediction.class_name)}
                      </Badge>
                      {/* <div className="text-3xl font-bold mb-2">
                        {formatClassName(response.prediction.class_name)}
                      </div> */}
                      <div className="text-sm text-gray-600 mb-4">
                        ID: {response.prediction.class_id}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Confianza:</span>
                          <span className={getConfidenceColor(response.prediction.confidence)}>
                            {(response.prediction.confidence * 100).toFixed(2)}%
                          </span>
                        </div>
                        <Progress
                          value={response.prediction.confidence * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Top 3 Predictions */}
                {response.top_3_predictions && (
                  <div>
                    <h3 className="font-semibold mb-3">Otras predicciones:</h3>
                    <div className="grid gap-3">
                      {response.top_3_predictions.map((pred, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center">
                                  {index + 1}
                                </Badge>
                                <span className="font-medium">
                                  {formatClassName(pred.class_name)}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={getConfidenceColor(pred.confidence)}>
                                  {(pred.confidence * 100).toFixed(2)}%
                                </span>
                                <Progress
                                  value={pred.confidence * 100}
                                  className="w-20 h-2"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="bg-gray-50 border-t text-sm text-gray-500">
            <p>
              Model: ResNet18 trained on EuroSAT •
              Accuracy: ~93% on validation
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default App
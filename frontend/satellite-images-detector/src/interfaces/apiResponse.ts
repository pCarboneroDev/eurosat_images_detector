import type { Prediction } from './prediction'

export interface ApiResponse {
  success: boolean
  prediction: Prediction
  top_3_predictions: Prediction[]
  filename: string
  error?: string
}
import type { ApiResponse } from "@/interfaces/apiResponse";

const baseUrl = 'http://localhost:8000'

export const call = async (file: File): Promise<ApiResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
        const res = await fetch(`${baseUrl}/predict`, {
            method: 'POST',
            body: formData,
        })

        const data: ApiResponse = await res.json()

        if (!res.ok) {
            throw new Error(data.error || 'Error en la predicción')
        }

        return data
    } catch (err) {
        throw new Error('Error al conectar al servidor')
    }
}
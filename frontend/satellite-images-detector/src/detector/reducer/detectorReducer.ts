import type { ApiResponse } from "@/interfaces/apiResponse";
interface DetectorState {
    selectedFile: File | null;
    previewUrl: string;
    isLoading: boolean;
    response: ApiResponse | null;
    error: string | null;
}

export const getInitialState = (): DetectorState => {

    return {
        selectedFile: null,
        previewUrl: '',
        isLoading: false,
        response: null,
        error: null
    }
}


export type DetectorAction =
    | { type: 'SET_FILE', payload: File }
    | { type: 'UPLOAD_FILE' }
    | { type: 'UPLOAD_SUCCESS', payload: ApiResponse }
    | { type: 'UPLOAD_ERROR', payload: string }


export const detectorReducer = (state: DetectorState, action: DetectorAction): DetectorState => {

    switch(action.type) {
        case 'SET_FILE': {
            const url = URL.createObjectURL(action.payload)
            return {
                ...state,
                selectedFile: action.payload,
                previewUrl: url
            }
        }

        case 'UPLOAD_FILE': {
            if (!state.selectedFile) {
                return {
                    ...state,
                    error: 'Please, select an image first'
                }
            }
            return {
                ...state,
                isLoading: true
            }
        }

        case 'UPLOAD_SUCCESS': {
            return {
                ...state,
                response: action.payload,
                isLoading: false
            }
        }

        case 'UPLOAD_ERROR': {
            return {
                ...state,
                error: action.payload,
                isLoading: false
            }
        }

        default: 
            return state;
    }
}
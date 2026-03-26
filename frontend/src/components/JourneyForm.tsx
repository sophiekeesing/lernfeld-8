import { useState } from 'react'
import type { FormEvent } from 'react'
import '../styles/JourneyForm.css'

interface JourneyFormProps {
    onSubmit: (data: JourneyData) => void
    isLoading?: boolean
}

export interface JourneyData {
    trainNumber: string
    fromStation: string
    toStation: string
    keyword: string
}

function JourneyForm({ onSubmit, isLoading = false }: JourneyFormProps) {
    const [formData, setFormData] = useState<JourneyData>({
        trainNumber: '',
        fromStation: '',
        toStation: '',
        keyword: ''
    })

    const [errors, setErrors] = useState<Partial<JourneyData>>({})

    const validateForm = (): boolean => {
        const newErrors: Partial<JourneyData> = {}

        if (!formData.trainNumber.trim()) {
            newErrors.trainNumber = 'Train number is required'
        }
        if (!formData.fromStation.trim()) {
            newErrors.fromStation = 'Departure station is required'
        }
        if (!formData.toStation.trim()) {
            newErrors.toStation = 'Arrival station is required'
        }
        if (!formData.keyword.trim()) {
            newErrors.keyword = 'Music keyword is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()

        if (validateForm()) {
            onSubmit(formData)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error for this field when user starts typing
        if (errors[name as keyof JourneyData]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }))
        }
    }

    return (
        <form onSubmit={handleSubmit} className="journey-form">
            <div className="form-group">
                <label htmlFor="trainNumber">Train Number</label>
                <input
                    type="text"
                    id="trainNumber"
                    name="trainNumber"
                    placeholder="e.g., ICE 17"
                    value={formData.trainNumber}
                    onChange={handleChange}
                    disabled={isLoading}
                />
                {errors.trainNumber && <span className="error">{errors.trainNumber}</span>}
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="fromStation">From</label>
                    <input
                        type="text"
                        id="fromStation"
                        name="fromStation"
                        placeholder="e.g., Hamburg"
                        value={formData.fromStation}
                        onChange={handleChange}
                        disabled={isLoading}
                    />
                    {errors.fromStation && <span className="error">{errors.fromStation}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="toStation">To</label>
                    <input
                        type="text"
                        id="toStation"
                        name="toStation"
                        placeholder="e.g., Berlin"
                        value={formData.toStation}
                        onChange={handleChange}
                        disabled={isLoading}
                    />
                    {errors.toStation && <span className="error">{errors.toStation}</span>}
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="keyword">Music Keyword</label>
                <input
                    type="text"
                    id="keyword"
                    name="keyword"
                    placeholder="e.g., chillhop, indie, jazz"
                    value={formData.keyword}
                    onChange={handleChange}
                    disabled={isLoading}
                />
                {errors.keyword && <span className="error">{errors.keyword}</span>}
            </div>

            <button
                type="submit"
                className="submit-btn"
                disabled={isLoading}
            >
                {isLoading ? 'Generating Your Playlist...' : 'Generate Playlist'}
            </button>
        </form>
    )
}

export default JourneyForm

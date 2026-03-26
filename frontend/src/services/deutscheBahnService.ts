// Deutsche Bahn API Service
const DB_API_BASE = 'https://v6.db.transport.rest'

export interface TrainJourney {
  departure: string
  arrival: string
  durationMs: number
  trainNumber: string
  fromStation: string
  toStation: string
}

interface JourneyLeg {
  departure: string
  arrival: string
}

interface JourneyData {
  legs: JourneyLeg[]
}

class DeutscheBahnService {
  async getStations(query: string) {
    try {
      const response = await fetch(
        `${DB_API_BASE}/stations?query=${encodeURIComponent(query)}&limit=10`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch stations')
      }

      return response.json()
    } catch (error) {
      console.error('Deutsche Bahn API error:', error)
      throw error
    }
  }

  async getJourneys(fromStation: string, toStation: string) {
    try {
      const response = await fetch(
        `${DB_API_BASE}/journeys?from=${encodeURIComponent(fromStation)}&to=${encodeURIComponent(toStation)}&results=5`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch journeys')
      }

      return response.json()
    } catch (error) {
      console.error('Deutsche Bahn API error:', error)
      throw error
    }
  }

  calculateJourneyDuration(departure: string, arrival: string): number {
    const departTime = new Date(departure).getTime()
    const arrivalTime = new Date(arrival).getTime()
    return arrivalTime - departTime // Returns milliseconds
  }

  parseJourneyData(fromStation: string, toStation: string, trainNumber: string, journeyData: JourneyData): TrainJourney {
    const leg = journeyData.legs[0] // Get first leg
    
    return {
      departure: leg.departure,
      arrival: leg.arrival,
      durationMs: this.calculateJourneyDuration(leg.departure, leg.arrival),
      trainNumber,
      fromStation,
      toStation
    }
  }
}

export default new DeutscheBahnService()

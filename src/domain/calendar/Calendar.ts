import TattooSession from "../TattooSession"
import { eachDayOfInterval, endOfMonth, endOfWeek, getWeekOfMonth, startOfMonth, startOfWeek } from "date-fns"

export default class Calendar<T> {
   private _years: Year<T>[] = []

   get years() { return this._years }
   set years(years: Year<T>[]) { this._years = years }

   public addYear(yearNumber: number, weekStartsOn: 0 | 1 = 1): Year<T> {
      const year = new Year<T>(yearNumber, weekStartsOn)
      this.years = [...this.years, year]
      return year
   }
}

export class Year<T> {
   private _year: number = 0
   private _months: Month<T>[] = []

   constructor(yearNumber: number, weekStartsOn: 0 | 1 = 1) {
      this.year = yearNumber

      const generatedMonths: Month<T>[] = []
      for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
         generatedMonths.push(new Month<T>(yearNumber, monthIndex, weekStartsOn))
      }

      this.months = generatedMonths
   }

   get year() { return this._year }
   set year(year: number) { this._year = year }

   get months() { return this._months }
   set months(months: Month<T>[]) { this._months = months }
}

export class Month<T> {
   private _month: number = 0
   private _month_name: string = ''
   private _weeks: Week<T>[] = []

   constructor(year: number, monthIndex: number, weekStartsOn: 0 | 1 = 1) {
      this.month = monthIndex

      const baseDate = new Date(year, monthIndex, 1)
      this.month_name = baseDate.toLocaleString('es-ES', { month: 'long' })

      const monthStart = startOfMonth(baseDate)
      const monthEnd = endOfMonth(baseDate)
      const gridStart = startOfWeek(monthStart, { weekStartsOn })
      const gridEnd = endOfWeek(monthEnd, { weekStartsOn })

      const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd })

      const generatedWeeks: Week<T>[] = []
      let weekCounter = 1

      for (let i = 0; i < allDays.length; i += 7) {
         const weekSlice = allDays.slice(i, i + 7)

         // Se descartan las fechas que pertenecen al mes anterior o siguiente
         const currentMonthDays = weekSlice.filter((date) => date.getMonth() === monthIndex)

         if (currentMonthDays.length > 0) {
            const dayInstances = currentMonthDays.map((date) => {
               const dayNumber = date.getDate()
               const dayInWeek = date.getDay()
               const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' })

               return new Day<T>(dayNumber, dayInWeek, dayName)
            })

            generatedWeeks.push(new Week<T>(weekCounter, dayInstances))
            weekCounter++
         }
      }

      this.weeks = generatedWeeks
   }

   get month() { return this._month }
   set month(month: number) { this._month = month }

   get month_name() { return this._month_name }
   set month_name(month_name: string) { this._month_name = month_name }

   get weeks() { return this._weeks }
   set weeks(weeks: Week<T>[]) { this._weeks = weeks }
}

export class Week<T> {
   private _weekNumber: number = 0
   private _days: Day<T>[] = []

   constructor(weekNumber: number, days: Day<T>[] = []) {
      this.weekNumber = weekNumber
      this.days = days
   }

   get weekNumber() { return this._weekNumber }
   set weekNumber(weekNumber: number) { this._weekNumber = weekNumber }

   get days() { return this._days }
   set days(days: Day<T>[]) { this._days = days }
}

export class Day<T> {
   private _dayNumber: number = 0
   private _dayInWeek: number = 0
   private _dayName: string = ''
   private _data!: T

   constructor(dayNumber: number, dayInWeek: number, dayName: string, data?: T) {
      this.dayNumber = dayNumber
      this.dayInWeek = dayInWeek
      this.dayName = dayName

      if (data !== undefined) {
         this.data = data
      }
   }

   get dayNumber() { return this._dayNumber }
   set dayNumber(dayNumber: number) { this._dayNumber = dayNumber }

   get dayInWeek() { return this._dayInWeek }
   set dayInWeek(dayInWeek: number) { this._dayInWeek = dayInWeek }

   get dayName() { return this._dayName }
   set dayName(dayName: string) { this._dayName = dayName }

   get data() { return this._data }
   set data(data: T) { this._data = data }
}


export class TattooCalendar extends Calendar<TattooSession[]> {
   constructor() {
      super()
   }

   public addSessions(sessions: TattooSession[]) {
      for (const session of sessions) {
         this.addSession(session)
      }
   }

   public addSession(session: TattooSession) {
      const sessionYear = session.starts_at.getFullYear()
      const sessionWeek = getWeekOfMonth(session.starts_at, { weekStartsOn: 1 })
      const sessionMonth = session.starts_at.getMonth()
      const sessionDay = session.starts_at.getDate()

      let year = this.years.find((year) => year.year === sessionYear)
      if (!year) year = this.addYear(sessionYear)

      const month = year.months.find((month) => month.month === sessionMonth)
      if (!month) throw new Error(`No se encontró el mes ${sessionMonth} del año ${sessionYear}`)

      const week = month.weeks.find((week) => week.weekNumber === sessionWeek)
      if (!week) throw new Error(`No se encontró la semana ${sessionWeek} del mes ${sessionMonth} del año ${sessionYear}`)

      const day = week.days.find((day) => day.dayNumber === sessionDay)
      if (!day) throw new Error(`No se encontró el día ${sessionDay} de la semana ${sessionWeek} del mes ${sessionMonth} del año ${sessionYear}`)

      day.data = Array.isArray(day.data) ? [...day.data, session] : [session]
   }

   public clone(): TattooCalendar {
      const clonedCalendar = new TattooCalendar()
      clonedCalendar.years = this.years

      return clonedCalendar
   }
}

"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { format, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Scissors, CheckCircle2, ChevronRight, ChevronLeft, Clock, Phone, Sparkles, User as UserIcon, Calendar as CalendarIcon, ListOrdered, MessageCircle } from "lucide-react"
import { getServices, getBarbers, createAppointment, getOccupiedSlots, getBarberSlots } from "@/app/actions/appointments"
import { addToWaitList } from "@/app/actions/waitlist"
import { getClosedDates } from "@/app/actions/closed-dates"
import Link from "next/link"

type Service = { id: string; name: string; price: number; duration: number }
type Barber = { id: string; name: string | null; image?: string | null; startTime?: string | null; endTime?: string | null }

interface BookingWizardProps {
    salonId: string
    salonPhone?: string
}

export function BookingWizard({ salonId, salonPhone = "" }: BookingWizardProps) {
    const [step, setStep] = useState(1)
    const [services, setServices] = useState<Service[]>([])
    const [barbers, setBarbers] = useState<Barber[]>([])
    const [availableSlots, setAvailableSlots] = useState<string[]>([])
    const [occupiedSlots, setOccupiedSlots] = useState<string[]>([])
    const [closedDates, setClosedDates] = useState<Date[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingSlots, setLoadingSlots] = useState(false)

    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null)
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [time, setTime] = useState<string | null>(null)
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [isWaitlist, setIsWaitlist] = useState(false)
    const shopPhone = salonPhone.replace(/\D/g, "")

    useEffect(() => {
        const init = async () => {
            try {
                const [servicesData, closed] = await Promise.all([
                    getServices(salonId),
                    getClosedDates(salonId),
                ])
                setServices(servicesData as Service[])
                setClosedDates(closed.map(c => new Date(c.date)))
            } catch {
                toast.error("Erro ao carregar dados.")
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [salonId])

    useEffect(() => {
        if (selectedService) {
            getBarbers(selectedService.id, salonId).then(data => setBarbers(data as Barber[]))
        }
    }, [selectedService, salonId])

    useEffect(() => {
        if (!date || !selectedBarber || !selectedService) return
        setLoadingSlots(true)
        Promise.all([
            getBarberSlots(date, selectedBarber.id, selectedService.duration),
            getOccupiedSlots(date, selectedBarber.id),
        ]).then(([slots, occupied]) => {
            setAvailableSlots(slots)
            setOccupiedSlots(occupied)
            if (time && occupied.includes(time)) setTime(null)
        }).catch(() => toast.error("Erro ao carregar horários."))
            .finally(() => setLoadingSlots(false))
    }, [date, selectedBarber, selectedService])

    const handleBook = async () => {
        if (isWaitlist) {
            if (!selectedService || !selectedBarber || !name || !phone) {
                toast.error("Preencha nome e WhatsApp para entrar na fila.")
                return
            }
            const result = await addToWaitList({
                customerName: name,
                customerPhone: phone,
                serviceId: selectedService.id,
                barberId: selectedBarber.id,
                preferredDate: date,
                salonId,
            })
            if (result.success) { toast.success("Você entrou na fila!"); setStep(5) }
            else toast.error(result.error || "Erro ao entrar na fila.")
            return
        }

        if (!selectedService || !selectedBarber || !date || !time || !name || !phone) {
            toast.error("Preencha todos os campos.")
            return
        }

        const [hours, minutes] = time.split(":").map(Number)
        const appointmentDate = new Date(date)
        appointmentDate.setHours(hours, minutes, 0, 0)

        const result = await createAppointment({
            date: appointmentDate,
            serviceId: selectedService.id,
            barberId: selectedBarber.id,
            customerName: name,
            customerPhone: phone,
            salonId,
        })

        if (result.success) { toast.success("Horário reservado!"); setStep(5) }
        else toast.error(result.error || "Erro ao reservar.")
    }

    const allSlotsFull = availableSlots.length > 0 && availableSlots.every(t => occupiedSlots.includes(t))

    const isDateDisabled = (d: Date) =>
        d < new Date(new Date().setHours(0, 0, 0, 0)) ||
        d.getDay() === 0 ||
        closedDates.some(cd => isSameDay(cd, d))

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-8">
                <div className="w-20 h-20 border-t-primary border-[6px] border-slate-100 rounded-full animate-spin shadow-2xl" />
                <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Sincronizando Agenda Premium...</p>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-16 pb-32 px-4 relative">
            {/* Step Indicators */}
            <div className="flex justify-between items-center max-w-2xl mx-auto relative pt-12">
                <div className="absolute top-[20px] md:top-[28px] left-0 w-full h-[2px] bg-slate-300 z-0" />
                {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="relative z-10 flex flex-col items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-xs md:text-sm font-black transition-all duration-700",
                            step >= s ? "bg-black text-white shadow-2xl shadow-black/30 scale-110" : "bg-white border-2 border-slate-300 text-slate-400"
                        )}>
                            {step > s ? <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /> : s}
                        </div>
                        <span className={cn("text-[8px] md:text-[9px] uppercase font-black tracking-widest hidden md:block", step === s ? "text-black" : "text-slate-400")}>
                            {s === 1 ? "Serviço" : s === 2 ? "Barbeiro" : s === 3 ? "Agenda" : "Finalizar"}
                        </span>
                    </div>
                ))}
            </div>

            <div className="bg-white border-8 border-black/10 rounded-[4rem] p-8 md:p-20 shadow-[0_60px_120px_-30px_rgba(0,0,0,0.2)] min-h-[600px] flex flex-col overflow-hidden relative">

                {/* STEP 1 — Serviço */}
                {step === 1 && (
                    <div className="flex-grow flex flex-col space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-6 h-6 text-amber-600" />
                                <span className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-500">EXPERIÊNCIA EXCLUSIVA</span>
                            </div>
                            <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-black leading-[0.8]">Escolha o <br /> <span className="text-amber-600 italic">Serviço</span></h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {services.map(service => (
                                <div
                                    key={service.id}
                                    className={cn(
                                        "group cursor-pointer p-10 rounded-[3.5rem] border-4 transition-all duration-500 relative bg-slate-100",
                                        selectedService?.id === service.id ? "border-black bg-white shadow-2xl scale-[1.05]" : "border-transparent hover:border-slate-400 hover:bg-white"
                                    )}
                                    onClick={() => { setSelectedService(service); setSelectedBarber(null); setTime(null) }}
                                >
                                    <div className="space-y-8">
                                        <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-700", selectedService?.id === service.id ? "bg-black text-white rotate-6 shadow-xl" : "bg-white text-black border-2 border-slate-200 group-hover:bg-black group-hover:text-white group-hover:rotate-12")}>
                                            <Scissors className="w-10 h-10" />
                                        </div>
                                        <div>
                                            <h4 className="text-3xl font-black uppercase tracking-tighter text-black mb-1">{service.name}</h4>
                                            <p className="text-[12px] font-black uppercase tracking-widest text-slate-500 mb-6">{service.duration} Minutos</p>
                                            <p className="text-5xl font-black tracking-tighter text-black italic">R$ {service.price.toFixed(0)}</p>
                                        </div>
                                    </div>
                                    {selectedService?.id === service.id && (
                                        <div className="absolute top-10 right-10">
                                            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center animate-in zoom-in duration-300 shadow-xl">
                                                <CheckCircle2 className="w-8 h-8" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-auto pt-20 flex justify-end">
                            <Button disabled={!selectedService} onClick={() => setStep(2)} className="rounded-[2.5rem] h-24 px-16 gap-6 font-black uppercase tracking-widest shadow-2xl shadow-black/30 hover:scale-105 active:scale-95 transition-all text-xl bg-black text-white hover:bg-slate-900">
                                Selecionar Profissional <ChevronRight className="w-8 h-8" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 2 — Barbeiro */}
                {step === 2 && (
                    <div className="flex-grow flex flex-col space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <UserIcon className="w-6 h-6 text-amber-600" />
                                <span className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-500">TIME DE ELITE</span>
                            </div>
                            <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-black leading-[0.8]">Seu <br /> <span className="text-amber-600 italic">Barbeiro</span></h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                            {barbers.length > 0 ? barbers.map(barber => (
                                <div key={barber.id}
                                    className={cn("group cursor-pointer rounded-[4.5rem] border-4 transition-all duration-700 overflow-hidden relative", selectedBarber?.id === barber.id ? "border-black shadow-2xl scale-[1.05]" : "border-transparent hover:border-slate-400 shadow-2xl shadow-slate-300")}
                                    onClick={() => { setSelectedBarber(barber); setTime(null) }}
                                >
                                    <div className="aspect-[3/4] bg-slate-200 relative overflow-hidden">
                                        {barber.image ? (
                                            <img src={barber.image} alt={barber.name ?? ""} className="object-cover w-full h-full transition-all duration-1000 scale-105 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-300 text-slate-500 font-black text-9xl italic uppercase">
                                                {barber.name?.charAt(0)}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90" />
                                        <div className="absolute bottom-0 left-0 p-12 w-full transform group-hover:-translate-y-4 transition-transform duration-500">
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mb-2">MASTER BARBER</p>
                                            <h3 className="text-4xl font-black uppercase tracking-tighter text-white drop-shadow-lg">{barber.name}</h3>
                                            {barber.startTime && barber.endTime && (
                                                <p className="text-xs text-amber-300 font-bold mt-1">{barber.startTime} – {barber.endTime}</p>
                                            )}
                                        </div>
                                        {selectedBarber?.id === barber.id && (
                                            <div className="absolute top-10 right-10 z-10">
                                                <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl animate-in zoom-in duration-500">
                                                    <CheckCircle2 className="w-10 h-10" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200 text-center">
                                    <UserIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <p className="text-xl font-bold text-slate-500 italic">Nenhum profissional disponível para este serviço.</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-auto pt-20 flex justify-between items-center">
                            <Button variant="ghost" onClick={() => setStep(1)} className="rounded-2xl h-16 px-10 gap-3 uppercase tracking-widest font-black text-sm text-slate-600 hover:text-black border-2 border-slate-200">
                                <ChevronLeft className="w-6 h-6" /> Voltar
                            </Button>
                            <Button disabled={!selectedBarber} onClick={() => setStep(3)} className="rounded-[2.5rem] h-24 px-16 gap-6 font-black uppercase tracking-widest shadow-2xl shadow-black/30 hover:scale-105 active:scale-95 transition-all text-xl bg-black text-white hover:bg-slate-900">
                                Escolher Horário <ChevronRight className="w-8 h-8" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 3 — Data e Horário */}
                {step === 3 && (
                    <div className="flex-grow flex flex-col space-y-10 animate-in fade-in duration-700">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Clock className="w-6 h-6 text-amber-600" />
                                <span className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-500">AGENDA EM TEMPO REAL</span>
                            </div>
                            <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-black leading-[0.8]">Data & <br /> <span className="text-amber-600 italic">Horário</span></h2>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-16 pt-10">
                            <div className="lg:w-[450px] shrink-0">
                                <div className="bg-slate-100 p-12 rounded-[4rem] border-4 border-slate-200 shadow-inner">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(d) => { setDate(d); setTime(null) }}
                                        disabled={isDateDisabled}
                                        className="rounded-3xl w-full text-black font-bold"
                                        locale={ptBR}
                                    />
                                </div>
                            </div>
                            <div className="flex-grow space-y-12">
                                <div className="flex items-center gap-8 pb-8 border-b-4 border-slate-100">
                                    <div className="w-20 h-20 rounded-[2.5rem] bg-black text-white flex items-center justify-center shadow-2xl">
                                        <CalendarIcon className="w-10 h-10" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-black text-lg uppercase tracking-widest text-slate-400">SELECIONADO PARA</h4>
                                        <p className="text-4xl font-black text-black uppercase tracking-tighter italic">{date ? format(date, "EEEE, dd 'de' MMMM", { locale: ptBR }) : ""}</p>
                                    </div>
                                </div>

                                {loadingSlots ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(t => <div key={t} className="h-20 rounded-3xl bg-slate-100 animate-pulse border-4 border-slate-200" />)}
                                    </div>
                                ) : availableSlots.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                        <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Selecione barbeiro e data para ver horários</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {availableSlots.map(t => {
                                            const isOccupied = occupiedSlots.includes(t)
                                            return (
                                                <Button key={t} variant={time === t ? "default" : "outline"} disabled={isOccupied} onClick={() => setTime(t)}
                                                    className={cn(
                                                        "h-20 rounded-[2rem] font-black transition-all text-2xl tracking-tighter border-4",
                                                        time === t ? "bg-black text-white border-black shadow-2xl scale-110" : "border-slate-200 bg-white text-black hover:border-black hover:bg-slate-50",
                                                        isOccupied && "opacity-20 line-through grayscale cursor-not-allowed bg-slate-200 border-transparent text-slate-500"
                                                    )}
                                                >{t}</Button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {!loadingSlots && allSlotsFull && (
                            <div className="bg-amber-50 border-4 border-amber-200 rounded-[2.5rem] p-10 flex flex-col sm:flex-row items-start sm:items-center gap-8">
                                <div className="w-16 h-16 shrink-0 rounded-[1.5rem] bg-amber-500 text-white flex items-center justify-center shadow-xl">
                                    <ListOrdered className="w-8 h-8" />
                                </div>
                                <div className="flex-grow space-y-1">
                                    <p className="font-black uppercase tracking-widest text-amber-900 text-sm">Agenda Lotada</p>
                                    <p className="text-amber-700 font-bold italic">Todos os horários estão ocupados. Entre na fila e te avisamos quando abrir uma vaga!</p>
                                </div>
                                <Button onClick={() => { setIsWaitlist(true); setStep(4) }} className="shrink-0 rounded-[2rem] h-16 px-10 font-black uppercase tracking-widest text-sm bg-amber-500 text-white hover:bg-amber-600 shadow-xl">
                                    Entrar na Fila
                                </Button>
                            </div>
                        )}

                        <div className="mt-auto pt-10 flex justify-between items-center">
                            <Button variant="ghost" onClick={() => setStep(2)} className="rounded-2xl h-16 px-10 gap-3 uppercase tracking-widest font-black text-sm text-slate-600 hover:text-black border-2 border-slate-200">
                                <ChevronLeft className="w-6 h-6" /> Voltar
                            </Button>
                            <div className="flex gap-4 items-center">
                                {!allSlotsFull && availableSlots.length > 0 && (
                                    <Button variant="outline" onClick={() => { setIsWaitlist(true); setStep(4) }} className="rounded-[2rem] h-16 px-8 gap-3 font-black uppercase tracking-widest text-sm border-2 border-amber-300 text-amber-700 hover:bg-amber-50">
                                        <ListOrdered className="w-5 h-5" /> Fila de Espera
                                    </Button>
                                )}
                                <Button disabled={!date || !time} onClick={() => { setIsWaitlist(false); setStep(4) }} className="rounded-[2.5rem] h-24 px-16 gap-6 font-black uppercase tracking-widest shadow-2xl shadow-black/30 hover:scale-105 active:scale-95 transition-all text-xl bg-black text-white hover:bg-slate-900">
                                    Revisar Detalhes <ChevronRight className="w-8 h-8" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4 — Finalizar */}
                {step === 4 && (
                    <div className="flex-grow flex flex-col space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                {isWaitlist ? <ListOrdered className="w-6 h-6 text-amber-600" /> : <Sparkles className="w-6 h-6 text-amber-600" />}
                                <span className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-500">{isWaitlist ? "FILA DE ESPERA" : "FINALIZAR RITUAL"}</span>
                            </div>
                            <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-black leading-[0.8]">Quase <br /> <span className="text-amber-600 italic">Lá</span></h2>
                            <p className="text-slate-700 font-bold italic text-2xl max-w-xl">
                                {isWaitlist ? "Deixe seus dados para entrarmos em contato quando abrir vaga." : "Confirme os detalhes para garantirmos sua vaga."}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                            <div className={cn("border-4 p-14 rounded-[4.5rem] space-y-12 relative overflow-hidden shadow-inner", isWaitlist ? "bg-amber-50 border-amber-200" : "bg-slate-100 border-slate-200")}>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full blur-3xl" />
                                {isWaitlist && (
                                    <div className="flex items-center gap-4 bg-amber-500/10 border-2 border-amber-300 rounded-[2rem] p-6">
                                        <ListOrdered className="w-8 h-8 text-amber-600 shrink-0" />
                                        <p className="text-sm font-black uppercase tracking-widest text-amber-700">Você entrará na fila de espera</p>
                                    </div>
                                )}
                                <div className="space-y-4">
                                    <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-400">SERVIÇO</p>
                                    <h4 className="text-4xl font-black uppercase tracking-tighter text-black">{selectedService?.name}</h4>
                                    <p className="text-xl font-bold text-amber-600 italic">R$ {selectedService?.price.toFixed(0)} • {selectedService?.duration} min</p>
                                </div>
                                <div className="space-y-4 pt-10 border-t-4 border-white/50">
                                    <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-400">BARBEIRO</p>
                                    <h4 className="text-4xl font-black uppercase tracking-tighter text-black italic leading-none">{selectedBarber?.name}</h4>
                                </div>
                                <div className="space-y-4 pt-10 border-t-4 border-white/50">
                                    <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-400">{isWaitlist ? "DATA PREFERIDA" : "AGENDAMENTO"}</p>
                                    <h4 className="text-4xl font-black uppercase tracking-tighter text-black leading-tight">
                                        {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : ""}
                                        {!isWaitlist && <><br /><span className="text-amber-600 italic">às {time}</span></>}
                                    </h4>
                                </div>
                            </div>

                            <div className="space-y-12 flex flex-col justify-center">
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <label className="text-sm font-black uppercase tracking-[0.5em] px-4 text-slate-500">SEU NOME COMPLETO</label>
                                        <input type="text" className="w-full h-24 px-10 font-black uppercase tracking-tighter text-4xl rounded-[2.5rem] border-4 border-slate-100 bg-slate-50 focus:bg-white focus:border-black outline-none transition-all placeholder:text-slate-300 text-black shadow-inner" placeholder="Ex: FERNANDO MEIRELLES" value={name} onChange={(e) => setName(e.target.value)} />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-sm font-black uppercase tracking-[0.5em] px-4 text-slate-500">WHATSAPP</label>
                                        <div className="relative">
                                            <Phone className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-slate-300" />
                                            <input type="tel" className="w-full h-24 pl-24 pr-10 font-black tracking-tighter text-4xl rounded-[2.5rem] border-4 border-slate-100 bg-slate-50 focus:bg-white focus:border-black outline-none transition-all placeholder:text-slate-300 text-black shadow-inner" placeholder="(11) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-8 pt-6">
                                    <Button onClick={handleBook} disabled={!name || !phone} className={cn("w-full h-32 text-3xl font-black uppercase tracking-[0.3em] rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] active:scale-95 transition-all border-b-8", isWaitlist ? "bg-amber-500 text-white hover:bg-amber-600 border-amber-700/30" : "bg-black text-white hover:bg-slate-900 border-black/20")}>
                                        {isWaitlist ? "ENTRAR NA FILA" : "CONFIRMAR AGORA"}
                                    </Button>
                                    <p className="text-xs text-center text-slate-400 uppercase font-black tracking-[0.2em] leading-relaxed max-w-sm mx-auto">
                                        {isWaitlist ? "Te avisaremos pelo WhatsApp quando uma vaga abrir." : "Ao clicar, você garante sua vaga exclusiva."}
                                    </p>
                                </div>
                                <Button variant="ghost" onClick={() => setStep(3)} className="rounded-2xl h-16 px-10 gap-3 uppercase tracking-widest font-black text-sm text-slate-600 hover:text-black border-2 border-slate-200">
                                    <ChevronLeft className="w-6 h-6" /> Voltar
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 5 — Sucesso */}
                {step === 5 && (
                    <div className="flex-grow flex flex-col items-center justify-center text-center space-y-16 animate-in zoom-in duration-700 py-10">
                        <div className={cn("w-56 h-56 rounded-[5rem] text-white flex items-center justify-center shadow-2xl rotate-6 border-8 border-black", isWaitlist ? "bg-amber-500" : "bg-amber-600")}>
                            {isWaitlist ? <ListOrdered className="w-28 h-28 drop-shadow-2xl" /> : <CheckCircle2 className="w-28 h-28 drop-shadow-2xl" />}
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-7xl md:text-[10rem] font-black uppercase tracking-tighter text-black leading-[0.8]">
                                {isWaitlist ? <>NA<br /><span className="text-amber-500 italic underline decoration-black/10">FILA!</span></> : <>TUDO<br /><span className="text-amber-600 italic underline decoration-black/10">PRONTO!</span></>}
                            </h2>
                            <p className="text-3xl text-slate-800 max-w-xl mx-auto font-black italic">
                                {isWaitlist
                                    ? <><strong>{name.split(" ")[0].toUpperCase()}</strong>, você está na fila! Te avisamos pelo WhatsApp quando abrir uma vaga.</>
                                    : <>Excelente escolha, <strong>{name.split(" ")[0].toUpperCase()}</strong>! Seu ritual está reservado.</>}
                            </p>
                        </div>

                        <div className={cn("text-white p-14 rounded-[5rem] w-full max-w-xl text-center space-y-6 shadow-2xl border-x-8 border-amber-600/30", isWaitlist ? "bg-amber-700" : "bg-black")}>
                            <p className="text-[12px] font-black uppercase tracking-[0.8em] text-amber-300">{isWaitlist ? "FILA DE ESPERA" : "HORÁRIO RESERVADO"}</p>
                            {isWaitlist ? (
                                <div className="space-y-2">
                                    <p className="text-3xl font-black uppercase tracking-tighter italic text-white">{selectedService?.name}</p>
                                    <p className="text-xl font-bold text-amber-300">com {selectedBarber?.name}</p>
                                    {date && <p className="text-lg font-bold text-amber-200">Data preferida: {format(date, "dd/MM/yyyy")}</p>}
                                </div>
                            ) : (
                                <p className="text-6xl font-black uppercase tracking-tighter italic text-white leading-none">
                                    {date ? format(date, "dd/MM/yyyy") : ""} <br />
                                    <span className="text-amber-500 text-7xl">ÀS {time}</span>
                                </p>
                            )}
                            <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 border-t-2 border-white/10 pt-8 px-10">RUA DA ELEGÂNCIA, 123 - CENTRO</p>
                        </div>

                        {/* Ações pós-agendamento */}
                        {!isWaitlist && shopPhone && (
                            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                                <Button
                                    onClick={() => {
                                        const msg = `Olá! Acabei de agendar:\n✂️ Serviço: ${selectedService?.name}\n👤 Barbeiro: ${selectedBarber?.name}\n📅 Data: ${date ? format(date, "dd/MM/yyyy") : ""}\n🕐 Horário: ${time}\n📱 Nome: ${name}`
                                        window.open(`https://wa.me/55${shopPhone}?text=${encodeURIComponent(msg)}`, "_blank")
                                    }}
                                    className="rounded-3xl h-20 px-10 font-black uppercase tracking-widest text-sm bg-emerald-500 text-white shadow-xl hover:bg-emerald-600 gap-3"
                                >
                                    <MessageCircle className="w-5 h-5" /> Confirmar pelo WhatsApp
                                </Button>
                            </div>
                        )}

                        {!isWaitlist && shopPhone && (
                            <div className="text-center space-y-3 pt-4 border-t border-slate-100 w-full max-w-md">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">PRECISA CANCELAR?</p>
                                <p className="text-sm text-slate-500 italic">Cancele com pelo menos 2h de antecedência enviando mensagem à barbearia.</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const msg = `Olá, preciso cancelar meu agendamento:\nNome: ${name}\nData: ${date ? format(date, "dd/MM/yyyy") : ""}\nHorário: ${time}`
                                        window.open(`https://wa.me/55${shopPhone}?text=${encodeURIComponent(msg)}`, "_blank")
                                    }}
                                    className="rounded-2xl border-slate-200 text-slate-500 text-xs font-black uppercase tracking-widest gap-2"
                                >
                                    <MessageCircle className="w-3 h-3" /> Solicitar Cancelamento
                                </Button>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-8 w-full justify-center pt-4">
                            <Button asChild variant="outline" className="rounded-3xl h-24 px-16 font-black uppercase tracking-widest text-sm border-4 border-slate-200 hover:bg-slate-50 text-slate-800">
                                <Link href="/">VOLTAR AO INÍCIO</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/components/auth/authContext"
import { Footer } from "@/components/footer/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, Save, CheckCircle2, Loader2 } from "lucide-react"
import { updateUserProfile, getUserBookingsCount } from "@/lib/api"

export function ProfilePage() {
    const navigate = useNavigate()
    const { user, isLoading: authLoading } = useAuth()
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")
    const [bookingsStats, setBookingsStats] = useState({
        totalBookings: 0,
        upcomingBookings: 0
    })
    const [loadingStats, setLoadingStats] = useState(true)

    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/login")
        }

        if (user) {
            setFullName(user.fullName || "")
            setEmail(user.email || "")
            setPhoneNumber(user.phoneNumber || "")

            const loadBookingsStats = async () => {
                try {
                    setLoadingStats(true)
                    const stats = await getUserBookingsCount(user.email)
                    console.log(stats)
                    setBookingsStats(stats)
                } catch (err) {
                    console.error('Error loading bookings stats:', err)
                } finally {
                    setLoadingStats(false)
                }
            }

            loadBookingsStats()
        }
    }, [user, authLoading, navigate])

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) {
        return null
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setSuccess(false)
        setError("")

        try {
            const response = await updateUserProfile({
                email: user.email,
                fullName,
                phoneNumber
            })

            if (response.user) {
                setFullName(response.user.fullName || "")
                setPhoneNumber(response.user.phoneNumber || "")
            }

            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            setError(err.response?.data?.error || "Error al actualizar el perfil")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1 bg-muted/30">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
                        <p className="text-muted-foreground mt-1">Gestiona tu información personal</p>
                    </div>

                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información Personal</CardTitle>
                                <CardDescription>Actualiza tus datos de contacto y preferencias</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {success && (
                                    <div className="mb-4 p-3 rounded-md border border-green-500 bg-green-50 dark:bg-green-950 flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <p className="text-sm text-green-600">Perfil actualizado correctamente</p>
                                    </div>
                                )}

                                {error && (
                                    <div className="mb-4 p-3 rounded-md border border-red-500 bg-red-50 dark:bg-red-950">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Nombre completo</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="fullName"
                                                type="text"
                                                placeholder="Tu nombre completo"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Correo electrónico</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={email}
                                                className="pl-10 bg-muted"
                                                disabled
                                                title="El correo electrónico no se puede cambiar"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">El correo electrónico no se puede modificar</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phoneNumber">Teléfono</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="phoneNumber"
                                                type="tel"
                                                placeholder="+54 9 11 1234 5678"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button type="submit" className="cursor-pointer" disabled={loading}>
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Guardando...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Guardar cambios
                                                </>
                                            )}
                                        </Button>
                                        <Button type="button" variant="outline" className="cursor-pointer" onClick={() => navigate("/")}>
                                            Cancelar
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Estadísticas de cuenta</CardTitle>
                                <CardDescription>Resumen de tu actividad en ReservAR</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loadingStats ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-4 rounded-lg bg-muted/50">
                                            <p className="text-sm text-muted-foreground">Reservas totales</p>
                                            <p className="text-2xl font-bold text-foreground mt-1">
                                                {bookingsStats.totalBookings}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-muted/50">
                                            <p className="text-sm text-muted-foreground">Próximas reservas</p>
                                            <p className="text-2xl font-bold text-foreground mt-1">
                                                {bookingsStats.upcomingBookings}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-muted/50">
                                            <p className="text-sm text-muted-foreground">Miembro desde</p>
                                            <p className="text-2xl font-bold text-foreground mt-1">
                                                {user.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}

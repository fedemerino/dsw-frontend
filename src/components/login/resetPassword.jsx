import { useState, useEffect } from "react"
import { useNavigate, Link, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, Lock, Loader2, CheckCircle2, ArrowLeft } from "lucide-react"
import { resetPassword } from "@/lib/api"
import { toast } from "sonner"

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Redirect to forgot password if no token found
    if (!token) {
      toast.error("Token no válido. Por favor, solicita un nuevo enlace.")
      navigate("/forgot-password")
    }
  }, [token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validaciones
    if (!newPassword || !confirmNewPassword) {
      setError("Por favor, completa todos los campos")
      return
    }

    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }

    if (newPassword !== confirmNewPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (!token) {
      setError("Token no válido. Por favor, solicita un nuevo enlace.")
      navigate("/forgot-password")
      return
    }

    setLoading(true)

    try {
      await resetPassword(token, newPassword, confirmNewPassword)
      setSuccess(true)
      toast.success("¡Contraseña restablecida exitosamente!")
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Error al restablecer la contraseña. Por favor, intenta nuevamente."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">ReservAR</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Restablecer contraseña</CardTitle>
            <CardDescription>
              Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && !success && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success ? (
              <Alert className="bg-green-50 text-green-900 border-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Contraseña actualizada exitosamente. Redirigiendo al inicio de sesión...
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva contraseña *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={8}
                    />
                  </div>
                  {newPassword && newPassword.length > 0 && newPassword.length < 8 && (
                    <p className="text-xs text-destructive">
                      La contraseña debe tener al menos 8 caracteres
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirmar nueva contraseña *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={8}
                    />
                  </div>
                  {confirmNewPassword && newPassword !== confirmNewPassword && (
                    <p className="text-xs text-destructive">
                      Las contraseñas no coinciden
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading || !token}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando contraseña...
                    </>
                  ) : (
                    "Restablecer contraseña"
                  )}
                </Button>
              </form>
            )}

            <div className="pt-4 border-t">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio de sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

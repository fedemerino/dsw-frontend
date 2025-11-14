import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, Mail, Loader2, CheckCircle2, ArrowLeft } from "lucide-react"
import { requestNewPassword } from "@/lib/api"
import { toast } from "sonner"

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!email) {
      setError("Por favor, ingresa tu correo electrónico")
      return
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido")
      return
    }

    setLoading(true)

    try {
      await requestNewPassword(email)
      setSuccess(true)
      toast.success("¡Email enviado exitosamente! Revisa tu bandeja de entrada.")
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Error al solicitar restablecimiento de contraseña. Por favor, intenta nuevamente."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
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
            <CardTitle className="text-2xl font-bold">¿Olvidaste tu contraseña?</CardTitle>
            <CardDescription>
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && !success && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success ? (
              <div className="space-y-4">
                <Alert className="bg-green-50 text-green-900 border-green-200">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Hemos enviado un enlace de restablecimiento a <strong>{email}</strong>. 
                    Por favor, revisa tu bandeja de entrada y sigue las instrucciones.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground text-center">
                    ¿No recibiste el email? Verifica tu carpeta de spam o intenta nuevamente.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSuccess(false)
                      setEmail("")
                      setError("")
                    }}
                  >
                    Enviar otro email
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar enlace de restablecimiento"
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

        <p className="text-center text-sm text-muted-foreground mt-4">
          ¿No tienes una cuenta?{" "}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}

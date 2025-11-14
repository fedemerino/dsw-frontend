import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Rating, RatingButton } from "@/components/ui/shadcn-io/rating"
import { createReview } from "@/lib/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function ReviewForm({ listingId, onReviewSubmitted }) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error("Por favor, selecciona una calificación")
      return
    }

    if (!comment.trim()) {
      toast.error("Por favor, escribe un comentario")
      return
    }

    setIsSubmitting(true)

    try {
      await createReview({
        rating,
        comment: comment.trim(),
        listingId,
      })

      toast.success("¡Reseña publicada exitosamente!")
      setOpen(false)
      setRating(0)
      setComment("")

      // Notificar al componente padre para refrescar las reseñas
      if (onReviewSubmitted) {
        onReviewSubmitted()
      }
    } catch (error) {
      console.error("Error creating review:", error)
      toast.error(
        error.response?.data?.message ||
          "Error al publicar la reseña. Por favor, intenta nuevamente."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form when closing
      setRating(0)
      setComment("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Dejar una reseña</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Dejar una reseña</DialogTitle>
          <DialogDescription>
            Comparte tu experiencia con otros huéspedes
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Calificación *</Label>
              <Rating
                value={rating}
                onValueChange={setRating}
                className="justify-center"
              >
                {[1, 2, 3, 4, 5].map((index) => (
                  <RatingButton
                    key={index}
                    size={32}
                    className="text-yellow-400 hover:text-yellow-500"
                  />
                ))}
              </Rating>
              {rating > 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  {rating} {rating === 1 ? "estrella" : "estrellas"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comentario *</Label>
              <Textarea
                id="comment"
                placeholder="Comparte tu experiencia con este alojamiento..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                required
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {comment.length} caracteres
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || rating === 0}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publicando...
                </>
              ) : (
                "Publicar reseña"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


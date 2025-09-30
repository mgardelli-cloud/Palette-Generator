import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Si è verificato un errore</AlertTitle>
        <AlertDescription className="mb-4">
          {error.message}
        </AlertDescription>
        <Button 
          variant="outline" 
          onClick={resetErrorBoundary}
        >
          Riprova
        </Button>
      </Alert>
    </div>
  )
}

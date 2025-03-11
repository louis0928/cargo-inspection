"use client"

import { useNavigate } from "react-router-dom"
import { AlertCircle } from "lucide-react"

const PageDoesNotExist = () => {
    const navigate = useNavigate()
    const goBack = () => navigate(-1)

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="mx-auto max-w-md text-center">
                <div className="mb-6 flex justify-center">
                    <div className="rounded-full bg-destructive/10 p-4">
                        <AlertCircle className="h-12 w-12 text-destructive" />
                    </div>
                </div>

                <h1 className="mb-2 text-4xl font-extrabold tracking-tight">Page Not Found</h1>

                <p className="mb-8 text-muted-foreground">
                    Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
                </p>

                <div className="flex justify-center">
                    <button
                        onClick={goBack}
                        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PageDoesNotExist

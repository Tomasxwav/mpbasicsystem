const ERROR_MESSAGES: Record<string, string> = {
  missing_code: "No se recibió el código de autorización.",
  auth_failed: "Error al autenticar con MercadoLibre. Intenta de nuevo.",
  server_error: "Error interno del servidor. Intenta de nuevo.",
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  return (
    <LoginContent searchParamsPromise={searchParams} />
  )
}

async function LoginContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ error?: string }>
}) {
  const { error } = await searchParamsPromise
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? "Ocurrió un error. Intenta de nuevo.") : null

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold text-foreground">Iniciar sesión</h1>

        {errorMessage && (
          <p className="rounded-md bg-red-100 px-4 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <a
          href={process.env.ML_OAUTH_URL}
          className="rounded-lg bg-yellow-400 px-8 py-3 font-semibold text-black transition-colors hover:bg-yellow-500"
        >
          Continuar con MercadoLibre
        </a>
      </div>
    </div>
  )
}

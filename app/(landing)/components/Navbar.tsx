export default function Navbar() {
  return (
    <div className='flex justify-between border-b border-border'>
      {/* Logo */}
      <div className='flex py-2.5 px-4 md:px-12 2xl:px-24 items-center gap-2'>
        <div className='w-12 aspect-square bg-mercadolibre rounded-2xl flex items-center justify-center p-2'>
          <img src="/meli-logo.png" alt="Mercado Libre Logo" className='w-auto h-auto' />
        </div>
        <div className='flex flex-col'>
          <h6 className='ml-2 font-bold text-xl'>MeLintegrator</h6>
          <p className='ml-2 text-sm text-text-secondary'>Tu control total de Mercado Libre</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className='flex gap-6 px-4 md:px-12 2xl:px-24 py-3 items-center'>
        <a href="#" className='text-sm text-text-secondary hover:text-foreground transition-colors'>Inicio</a>
        <a href="#" className='text-sm text-text-secondary hover:text-foreground transition-colors'>Precios</a>
        <a href="" className='text-sm text-text-secondary hover:text-foreground transition-colors'>Integraciones</a>
        <a href="" className='text-sm text-text-secondary hover:text-foreground transition-colors'>Recursos</a>
        <a href="#" className='text-sm text-text-secondary hover:text-foreground transition-colors'>Contacto</a>
      </nav>

      {/* CTA */}
      <div className='flex items-center gap-4 px-4 md:px-12 2xl:px-24 py-3'>
        <button className='px-4 py-2 rounded-lg text-sm font-medium border border-border text-text-secondary hover:bg-surface transition-colors'>
          Iniciar sesión
        </button>
        <button className='px-4 py-2 rounded-lg text-sm font-medium text-[#1a1a1a] bg-linear-to-r from-[#ffe600] to-[#fff1a4] hover:opacity-90 transition-opacity'>
          Regístrate
        </button>
      </div>
    </div>
  )
}
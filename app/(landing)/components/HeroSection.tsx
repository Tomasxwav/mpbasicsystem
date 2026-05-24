import { Clock, Bot, TrendingUp, Star, ArrowRight, PlayCircle } from "lucide-react";
import Image from 'next/image';

const features = [
  { icon: Clock, label: "Ahorra horas de trabajo" },
  { icon: Bot, label: "Respuestas con IA 24/7" },
  { icon: TrendingUp, label: "Más venta, menos esfuerzo" },
];

export default function HeroSection() {
  return (
    <section className="relative perspective-distant w-full flex flex-col px-4 md:px-12 2xl:px-24 py-20 gap-6 border-b border-border">

      <div className='relative transform-style-preserve-3d'>
        <img src="/Screenshot.png" alt="Dashboard Image" className='h-120 absolute right-20 rotate-x-5 rotate-y-40 rotate-z-6 mt-16 '/>
        <div className='bg-gray-400 h-120 absolute right-20 rotate-x-5 rotate-y-40 rotate-z-6 mt-16 '/>
        <div className='bg-gray-400 h-120 absolute right-20 rotate-x-5 rotate-y-40 rotate-z-6 mt-16 '/>
      </div>

      <span className="inline-flex uppercase px-4 py-1.5 rounded-full text-xs font-bold bg-mercadolibre/50 text-foreground w-fit">
        Plataforma todo en uno
      </span>

      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight max-w-3xl">
        Automatiza tu negocio en{" "}
        <span className="bg-linear-to-r from-[#ffe600] to-[#fff1a4] bg-clip-text text-transparent">
          Mercado Libre
        </span>{" "}
        con{" "}
        <span className="bg-linear-to-r from-[#fff1a4] to-[#ffe600] bg-clip-text text-transparent">
          IA
        </span>
      </h1>

      <p className="text-base sm:text-lg text-text-secondary max-w-xl leading-relaxed">
        Gestiona publicaciones, responde clientes, analiza métricas y aumenta
        tus ventas desde un solo lugar.
      </p>

      <div className="flex flex-col gap-3 mt-2">
        {features.map(({ icon: Icon, label }) => (
          <div key={label} className="flex gap-2 text-text-secondary text-sm items-center">
            <Icon className="w-4 h-4 text-text-secondary shrink-0" />
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        <button className="flex items-center gap-2 px-6 md:px-10  py-3 rounded-xl font-semibold text-lg border border-border text-[#1a1a1a] bg-linear-to-r from-[#ffe600] to-[#fff1a4] hover:opacity-90 transition-opacity cursor-pointer">
          Comenzar <ArrowRight className="w-4 h-4 ml-1" />
        </button>
        <button className="flex items-center gap-2 px-6 md:px-10 py-3 rounded-xl font-semibold text-lg border border-border text-text-secondary hover:bg-surface transition-colors cursor-pointer">
          Ver demo <PlayCircle className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="flex flex-col gap-6 mt-6">
        <p className="text-xs text-text-secondary">Conectado con Mercado Libre</p>
        <div className="flex items-center gap-8">
        <Image src={"/meli-logo.png"} width={80} height={10} alt='Mercado Libre Logo'/>
          <div className='flex flex-col'>
            <div className='flex'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-mercadolibre text-mercadolibre" />
              ))}
            </div>
            <span className="text-xs text-text-secondary ml-1">de confianza</span>
          </div>
        </div>
      </div>

    </section>
  );
}

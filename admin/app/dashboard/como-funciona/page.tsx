import { createClient } from '@/utils/supabase/server'
import ComoFuncionaForm from '@/components/ComoFuncionaForm'

async function getData() {
  const supabase = await createClient()
  const [pasosRes, valorRes, faqsRes] = await Promise.all([
    supabase.from('cf_pasos').select('paso_num,titulo,descripcion,imagen_url').order('paso_num'),
    supabase.from('cf_valor').select('bloque,titulo,texto,imagen_url'),
    supabase.from('cf_faq').select('id,pregunta,respuesta,orden,activo').order('orden'),
  ])
  return {
    pasos: pasosRes.data ?? [],
    valor: valorRes.data ?? [],
    faqs:  faqsRes.data  ?? [],
  }
}

export default async function ComoFuncionaPage() {
  const { pasos, valor, faqs } = await getData()

  return (
    <>
      <header className="top-header">
        <nav className="top-header__breadcrumb" aria-label="Breadcrumb">
          <span>Configuración</span>
          <span className="top-header__breadcrumb-sep" aria-hidden="true">/</span>
          <span>Cómo funciona</span>
        </nav>
      </header>

      <main className="page-content">
        <div className="page-header">
          <h1 className="page-header__title">Cómo funciona</h1>
          <p className="page-header__subtitle">
            Administra los pasos del proceso, los bloques de valor y las preguntas frecuentes.
          </p>
        </div>

        <ComoFuncionaForm pasos={pasos as any} valor={valor as any} faqs={faqs as any} />
      </main>
    </>
  )
}

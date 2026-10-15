import text from './messages.json'

export default function App() {
  return <main className="min-h-screen bg-[#123f35] p-10 text-[#f6f1e5]">
    <h1 className="font-serif text-5xl">{text.title}</h1>
    <p className="mt-4">{text.subtitle}</p>
  </main>
}

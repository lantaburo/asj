import { getAiBrain, upsertAiBrain } from "@/features/cms/ai.service";
import { revalidatePath } from "next/cache";

export default async function AiBrainPage() {
  const brain = await getAiBrain("SEO_METADATA");

  async function updateBrain(formData: FormData) {
    "use server";
    const prompt = formData.get("prompt") as string;
    await upsertAiBrain("SEO_METADATA", prompt);
    revalidatePath("/admin/ai-brain");
  }

  return (
    <div style={{ display: 'grid', gap: '30px' }}>
      <section className="britsafe-card" style={{ padding: '40px' }}>
        <h1 className="britsafe-card__title">AI BRAIN Configuration</h1>
        <p className="britsafe-card__copy">
          Custom prompt untuk mengontrol bagaimana AI menghasilkan SEO Meta Description dan Keywords.
        </p>
        
        <form action={updateBrain} style={{ display: 'grid', gap: '20px', marginTop: '30px' }}>
          <div style={{ display: 'grid', gap: '8px' }}>
            <label style={{ fontWeight: '700', fontSize: '13px' }}>SEO System Prompt</label>
            <textarea 
              name="prompt"
              defaultValue={brain?.systemPrompt || ""}
              style={{ minHeight: '300px', padding: '15px', borderRadius: '8px', border: '1px solid var(--ajs-border)', fontSize: '14px', fontFamily: 'monospace' }}
              placeholder="Contoh: Berikan meta deskripsi (maks 160 karakter) dan 5-10 kata kunci yang relevan..."
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>
            Simpan Konfigurasi Brain
          </button>
        </form>
      </section>
    </div>
  );
}

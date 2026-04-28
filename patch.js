const fs = require('fs');
let code = fs.readFileSync('src/features/users/instructor-assessor-panel.tsx', 'utf-8');

// Add editing state and delete handle
code = code.replace(
  /const \[selectedRole, setSelectedRole\] = useState<Role>\("INSTRUCTOR"\);/,
  `const [selectedRole, setSelectedRole] = useState<Role>("INSTRUCTOR");
  const [editingMember, setEditingMember] = useState<InternalMember | null>(null);
  
  async function handleDelete(id: string) {
    if (!window.confirm("Apakah Anda yakin ingin menghapus member ini?")) return;
    startTransition(async () => {
      try {
        const res = await fetch(\`/api/internal-members/\${id}\`, { method: "DELETE" });
        if (!res.ok) throw new Error("Gagal menghapus member.");
        window.location.reload();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Terjadi kesalahan");
      }
    });
  }`
);

// Update handleSubmit to handle PATCH if editingMember
code = code.replace(
  /const response = await fetch\("\/api\/internal-members", {/,
  `const response = await fetch(editingMember ? \`/api/internal-members/\${editingMember.id}\` : "/api/internal-members", {
          method: editingMember ? "PATCH" : "POST",`
).replace(
  /method: "POST",/,
  ""
);

// Update success message
code = code.replace(
  /message: "Data member berhasil ditambahkan."/,
  `message: editingMember ? "Data member berhasil diperbarui." : "Data member berhasil ditambahkan."`
);

// Update open form logic
code = code.replace(
  /onClick=\{\(\) => setViewMode\("add-member"\)\}/,
  `onClick={() => { setEditingMember(null); setSelectedRole("INSTRUCTOR"); setViewMode("add-member"); }}`
);

// Update Close form logic
code = code.replace(
  /onClick=\{\(\) => setViewMode\("list"\)\}/,
  `onClick={() => { setViewMode("list"); setEditingMember(null); }}`
);

// Update form titles
code = code.replace(
  /Tambah Member Internal/,
  `{editingMember ? "Edit Member Internal" : "Tambah Member Internal"}`
);
code = code.replace(
  /\{isPending \? "Menyimpan\.\.\." : "Create Member"\}/,
  `{isPending ? "Menyimpan..." : editingMember ? "Update Member" : "Create Member"}`
);

// Add edit/delete buttons to the cards
code = code.replace(
  /<\/div>\s*<span\s*style=\{\{/m,
  `</div>
                      <div style={{ display: "flex", gap: "8px", flexDirection: "column", alignItems: "flex-end" }}>
                      <span
                        style={{`
).replace(
  /\{member\.isActive \? "Aktif" : "Nonaktif"\}\s*<\/span>\s*<\/div>/,
  `{member.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button type="button" onClick={() => { setEditingMember(member); setSelectedRole(member.role); setViewMode("add-member"); }} style={{ fontSize: "11px", fontWeight: "bold", color: "var(--accent)", background: "transparent", border: "none", cursor: "pointer" }}>Edit</button>
                        <button type="button" onClick={() => handleDelete(member.id)} style={{ fontSize: "11px", fontWeight: "bold", color: "#dc2626", background: "transparent", border: "none", cursor: "pointer" }}>Hapus</button>
                      </div>
                      </div>
                    </div>`
);

// Prepopulate fields
code = code.replace(
  /name="fullName"\n\s*placeholder="Dr. John Doe"\n\s*required/,
  `name="fullName"\n                defaultValue={editingMember?.fullName}\n                placeholder="Dr. John Doe"\n                required`
);
code = code.replace(
  /name="email"\n\s*placeholder="johndoe@example.com"\n\s*required/,
  `name="email"\n                defaultValue={editingMember?.email}\n                placeholder="johndoe@example.com"\n                required`
);
code = code.replace(
  /name="phone"\n\s*placeholder="081234567890"/,
  `name="phone"\n                defaultValue={editingMember?.phone ?? ""}\n                placeholder="081234567890"`
);
code = code.replace(
  /name="instructorLevel" required>/,
  `name="instructorLevel" required defaultValue={editingMember?.instructorLevel ?? "JUNIOR"}>`
);
code = code.replace(
  /name="licenseNumber"\n\s*placeholder="Contoh: MET.000.000213.2023 atau 5\/123\/AS.02.04\/V\/2026"/,
  `name="licenseNumber"\n                defaultValue={editingMember?.licenseNumber ?? ""}\n                placeholder="Contoh: MET.000.000213.2023 atau 5/123/AS.02.04/V/2026"`
);
code = code.replace(
  /name="password"\n\s*minLength=\{8\}\n\s*placeholder="Minimal 8 karakter"\n\s*required/,
  `name="password"\n                  minLength={8}\n                  placeholder={editingMember ? "Kosongkan jika tidak ingin mengubah password" : "Minimal 8 karakter"}\n                  required={!editingMember}`
);
code = code.replace(
  /type="checkbox" name="isActive" defaultChecked /,
  `type="checkbox" name="isActive" defaultChecked={editingMember ? editingMember.isActive : true} `
);

fs.writeFileSync('src/features/users/instructor-assessor-panel.tsx', code);

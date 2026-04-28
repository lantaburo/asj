const fs = require('fs');
let code = fs.readFileSync('src/features/users/instructor-assessor-panel.tsx', 'utf-8');

// 1. Add profilePictureUrl to InternalMember type
code = code.replace(
  /licenseNumber: string \| null;/,
  `licenseNumber: string | null;\n  profilePictureUrl: string | null;`
);

// 2. Change fetch to send FormData instead of JSON
const oldFetch = `const payload = {
      fullName: getRequiredString(formData.get("fullName")),
      email: getRequiredString(formData.get("email")),
      phone: getOptionalString(formData.get("phone")),
      role: role,
      instructorLevel:
        role === "INSTRUCTOR"
          ? getOptionalString(formData.get("instructorLevel"))
          : null,
      licenseNumber: getOptionalString(formData.get("licenseNumber")),
      password: getOptionalString(formData.get("password")),
      isActive: formData.get("isActive") === "on"
    };

    startTransition(async () => {
      try {
        const response = await fetch(editingMember ? \`/api/internal-members/\${editingMember.id}\` : "/api/internal-members", {
          method: editingMember ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });`;

const newFetch = `// Send FormData directly so files can be uploaded
    startTransition(async () => {
      try {
        const response = await fetch(editingMember ? \`/api/internal-members/\${editingMember.id}\` : "/api/internal-members", {
          method: editingMember ? "PATCH" : "POST",
          body: formData
        });`;

code = code.replace(oldFetch, newFetch);

// 3. Add Photo input to the form
const photoInput = `
            <label className="field-group" style={{ marginBottom: "12px" }}>
              <span className="field-label">Foto Profil (opsional)</span>
              <input
                type="file"
                className="text-input"
                name="profilePicture"
                accept="image/jpeg, image/png, image/webp"
              />
              <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px" }}>
                Maksimal 2MB. Format: JPG, PNG, WEBP.
              </span>
              {editingMember?.profilePictureUrl && (
                <label style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "8px", fontSize: "12px", color: "#dc2626" }}>
                  <input type="checkbox" name="removePhoto" value="true" />
                  Hapus foto saat ini
                </label>
              )}
            </label>
`;

code = code.replace(
  /<label className="field-group" style=\{\{ marginBottom: "12px" \}\}>\n\s*<span className="field-label">Nomor Registrasi \/ Lisensi Resmi \(opsional\)<\/span>/,
  `${photoInput}\n            <label className="field-group" style={{ marginBottom: "12px" }}>\n              <span className="field-label">Nomor Registrasi / Lisensi Resmi (opsional)</span>`
);

// 4. Update the card to display the photo
const photoDisplay = `
                      {member.profilePictureUrl ? (
                        <img 
                          src={member.profilePictureUrl} 
                          alt={member.fullName} 
                          style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", backgroundColor: "var(--line)" }} 
                        />
                      ) : (
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--ajs-blue)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "16px" }}>
                          {member.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
`;

code = code.replace(
  /<div>\n\s*<strong\n\s*style=\{\{\n\s*fontSize: "15px",\n\s*color: "var\(--ink\)",\n\s*display: "block",\n\s*lineHeight: 1\.2\n\s*\}\}\n\s*>/,
  `${photoDisplay}                        <strong\n                          style={{\n                            fontSize: "15px",\n                            color: "var(--ink)",\n                            display: "block",\n                            lineHeight: 1.2\n                          }}\n                        >`
);

code = code.replace(
  /<\/div>\n\s*<span\n\s*style=\{\{\n\s*fontSize: "10px",/,
  `</div>\n                    </div>\n                      <span\n                        style={{\n                          fontSize: "10px",`
);

fs.writeFileSync('src/features/users/instructor-assessor-panel.tsx', code);

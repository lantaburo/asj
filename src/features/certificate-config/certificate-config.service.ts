import { getCertificateConfigByProgram, updateCertificateConfig } from "./certificate-config.repository";
import { CertificateConfigUpdateDto } from "./certificate-config.schema";

export async function fetchCertificateConfig(programId?: string | null) {
  return getCertificateConfigByProgram(programId);
}

export async function saveCertificateConfig(data: CertificateConfigUpdateDto) {
  return updateCertificateConfig(data.programId, data);
}

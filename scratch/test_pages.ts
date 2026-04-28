import { getAdminPrograms, getProgramStatisticsList } from "../src/features/programs/program.service";
import { getAdminBatches } from "../src/features/batches/batch.service";
import { getClassroomList } from "../src/features/classrooms/classroom.service";
import { getSessionList } from "../src/features/sessions/session.service";
import { getUnitSchemaList } from "../src/features/unit-schemas/unit-schema.service";
import { getInternalMemberList } from "../src/features/users/internal-member.service";
import { listArticles } from "../src/features/cms/article.service";
import { fetchCertificateConfig } from "../src/features/certificate-config/certificate-config.service";

async function testQueries() {
  console.log("Testing buat-program queries...");
  try { await getAdminPrograms(); console.log("getAdminPrograms OK"); } catch(e:any) { console.error("getAdminPrograms", e.message); }
  try { await getAdminBatches(); console.log("getAdminBatches OK"); } catch(e:any) { console.error("getAdminBatches", e.message); }
  try { await getClassroomList(); console.log("getClassroomList OK"); } catch(e:any) { console.error("getClassroomList", e.message); }
  try { await getSessionList(); console.log("getSessionList OK"); } catch(e:any) { console.error("getSessionList", e.message); }
  try { await getInternalMemberList(); console.log("getInternalMemberList OK"); } catch(e:any) { console.error("getInternalMemberList", e.message); }
  try { await getUnitSchemaList(); console.log("getUnitSchemaList OK"); } catch(e:any) { console.error("getUnitSchemaList", e.message); }
  try { await getProgramStatisticsList(); console.log("getProgramStatisticsList OK"); } catch(e:any) { console.error("getProgramStatisticsList", e.message); }
  
  console.log("Testing artikel queries...");
  try { await listArticles(); console.log("listArticles OK"); } catch(e:any) { console.error("listArticles", e.message); }

  console.log("Testing pengaturan sertifikat queries...");
  try { await fetchCertificateConfig(); console.log("fetchCertificateConfig OK"); } catch(e:any) { console.error("fetchCertificateConfig", e.message); }
}

testQueries();

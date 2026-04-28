import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentSessionUser, canManageMasterData } from "@/features/auth/auth.service";
import { deleteSchemaUnitRecord, updateSchemaUnitRecord } from "@/features/unit-schemas/unit-schema.service";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ unitId: string }> }
) {
  try {
    const currentUser = await getCurrentSessionUser();
    if (!currentUser || !canManageMasterData(currentUser.role)) {
      return NextResponse.json(
        { error: { message: "Akses ditolak. Anda tidak memiliki izin." } },
        { status: 403 }
      );
    }

    const { unitId } = await params;
    console.log("HAPUS UNIT API HIT:", unitId);
    await deleteSchemaUnitRecord(unitId);
    console.log("UNIT HAS BEEN DELETED:", unitId);
    revalidatePath("/admin/unit-skema");
    revalidatePath("/admin/master-data");

    return NextResponse.json({
      success: true,
      message: "Unit kompetensi berhasil dihapus."
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: { message: error.message } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { message: "Gagal menghapus unit kompetensi." } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ unitId: string }> }
) {
  try {
    const currentUser = await getCurrentSessionUser();
    if (!currentUser || !canManageMasterData(currentUser.role)) {
      return NextResponse.json(
        { error: { message: "Akses ditolak. Anda tidak memiliki izin." } },
        { status: 403 }
      );
    }

    const { unitId } = await params;
    const body = await req.json();

    console.log("UPDATE UNIT API HIT:", unitId);
    await updateSchemaUnitRecord(unitId, body);
    console.log("UNIT HAS BEEN UPDATED:", unitId);
    revalidatePath("/admin/unit-skema");
    revalidatePath("/admin/master-data");

    return NextResponse.json({
      success: true,
      message: "Unit kompetensi berhasil diupdate."
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: { message: error.message } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { message: "Gagal mengupdate unit kompetensi." } },
      { status: 500 }
    );
  }
}

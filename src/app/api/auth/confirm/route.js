import { supabase } from "@/app/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, code } = await req.json();

    // проверка валидности email и кода
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("confirmation_code", code)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Неверный код подтверждения" },
        { status: 400 }
      );
    }

    // обновление статуса подтверждения в БД
    const { error: updateError } = await supabase
      .from("users")
      .update({ confirmed: true, confirmation_code: code })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Ошибка при подтверждении" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Пользователь успешно подтвержден" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка на сервере" }, { status: 500 });
  }
}

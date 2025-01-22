import { supabase } from "@/app/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { firstName, lastName, email, username, password, code } =
      await req.json();

    // хэширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // получение ip address
    const ip = req.headers.get("x-user-ip");

    // сохранение нового пользователя в БД
    const { error: insertError } = await supabase
      .from("users")
      .insert([
        {
          email,
          username,
          password_hash: hashedPassword,
          first_name: firstName,
          last_name: lastName,
          confirmation_code: confirmationCode,
          confirmed: false,
          ip_address: ip,
        },
      ])
      .select();

    if (insertError) {
      return NextResponse.json(
        {
          error: "Ошибка при сохранении пользователя в БД",
          details: error.message,
        },
        { status: 500 }
      );
    }

    // проверка валидности email и кода
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("confirmation_code", code)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { message: "Неверный код подтверждения" },
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

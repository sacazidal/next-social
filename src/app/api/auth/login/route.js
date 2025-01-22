import { supabase } from "@/app/lib/supabaseServer";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { error } from "console";

export async function POST(req) {
  const { username, password } = await req.json();

  try {
    const ip = req.headers.get("x-user-ip");

    // Получаем пользователя из базы данных
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, email, username, password_hash, first_name, last_name")
      .eq("username", username)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        {
          message: "Неверный логин или пароль(пользователь не найден)",
          error: "Неверный логин или пароль(пользователь не найден)",
        },
        { status: 404 }
      );
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(
      password,
      userData.password_hash
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          message: "Неверный логин или пароль(неверный пароль)",
          error: "Неверный логин или пароль(пользователь не найден)",
        },
        { status: 401 }
      );
    }

    // Логируем вход пользователя
    const { data: loginData, error: loginError } = await supabase
      .from("logins")
      .insert([{ user_id: userData.id, ip_address: ip }]);

    if (loginError) {
      return NextResponse.json(
        { error: "Ошибка при логировании" },
        { status: 500 }
      );
    }

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: userData.email,
        password,
      });

    if (authError || !authData.session) {
      return NextResponse.json(
        { error: "Ошибка при авторизации" },
        { status: 500 }
      );
    }

    // Возвращаем данные пользователя без пароля
    const { password_hash, ...userWithoutPassword } = userData;
    return NextResponse.json(
      { user: userWithoutPassword, token: authData.session.access_token },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Ошибка при входе" },
      { status: 500 }
    );
  }
}

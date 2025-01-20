import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { supabase } from "@/app/lib/supabaseServer";

function generateConfirmationEmail() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // получаем случайный номер из 6-значного диапазона
}

async function sendConfirmationEmail(email, code) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "Подтверждение регистрации",
    html: `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Подтверждение регистрации</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          background-color: #007bff;
          color: #ffffff;
          border-radius: 8px 8px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 20px;
          color: #333333;
        }
        .content h2 {
          font-size: 20px;
          margin-bottom: 20px;
        }
        .content p {
          font-size: 16px;
          line-height: 1.6;
        }
        .code {
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: #ffffff;
          font-size: 24px;
          font-weight: bold;
          border-radius: 4px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 14px;
          color: #777777;
          border-top: 1px solid #eeeeee;
          margin-top: 20px;
        }
        .footer a {
          color: #007bff;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Подтверждение регистрации</h1>
        </div>
        <div class="content">
          <h2>Здравствуйте!</h2>
          <p>Благодарим вас за регистрацию на нашем сайте. Для завершения регистрации, пожалуйста, введите следующий код подтверждения:</p>
          <div class="code">${code}</div>
          <p>Если вы не регистрировались на нашем сайте, пожалуйста, проигнорируйте это письмо.</p>
        </div>
        <div class="footer">
          <p>С уважением,<br>Команда <a href="https://вашсайт.ru">Next Social Network</a></p>
        </div>
      </div>
    </body>
    </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function POST(req) {
  const { firstName, lastName, email, username, password } = await req.json();

  try {
    // проверка наличия обязательных полей
    const fields = [
      { key: firstName, name: "Имя" },
      { key: lastName, name: "Фамилия" },
      { key: email, name: "Email" },
      { key: username, name: "Логин" },
      { key: password, name: "Пароль" },
    ];
    const missingField = fields.find((field) => !field.key);
    if (missingField) {
      return NextResponse.json(
        { message: `Заполните поле '${missingField.name}'` },
        { status: 400 }
      );
    }

    // получение ip address
    const ip = req.headers.get("x-user-ip");

    // проверка уникальности email и username
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .or(`email.eq.${email}, username.eq.${username}`);

    if (userError) {
      return NextResponse.json(
        { error: "Ошибка при проверке пользователя" },
        { status: 500 }
      );
    }

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json(
        { message: "Пользователь с таким email или username уже существует" },
        { status: 409 }
      );
    }

    // хэширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // генерация кода подтверждения
    const confirmationCode = generateConfirmationEmail();

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
        { error: "Ошибка при сохранении пользователя в БД" },
        { status: 500 }
      );
    }

    // отправка письма с кодом подтверждения
    await sendConfirmationEmail(email, confirmationCode);

    // проверка на длину пароля
    if (password.lenght <= 6) {
      return NextResponse.json(
        { message: "Пароль должен быть не менее 6 символов" },
        { status: 400 }
      );
    }

    // успешный ответ
    return NextResponse.json(
      { message: "Письмо с кодом подтверждения отправлено на ваш email" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Ошибка при регистрации" },
      { status: 500 }
    );
  }
}

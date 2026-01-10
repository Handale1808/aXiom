import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, findUserByEmail } from "@/lib/db/users";
import { ValidationError, DatabaseError } from "@/lib/errors";
import { withMiddleware } from "@/lib/utils/middleware";

interface SignupRequestBody {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "PASSWORD_MUST_BE_8+_CHARACTERS";
  }
  if (!/[A-Z]/.test(password)) {
    return "PASSWORD_REQUIRES_UPPERCASE";
  }
  if (!/[a-z]/.test(password)) {
    return "PASSWORD_REQUIRES_LOWERCASE";
  }
  if (!/[0-9]/.test(password)) {
    return "PASSWORD_REQUIRES_NUMBER";
  }
  return null;
}

async function handler(
  request: NextRequest,
  context: { requestId: string }
): Promise<NextResponse> {
  const { requestId } = context;

  const body: SignupRequestBody = await request.json();
  const { email, firstName, lastName, password, confirmPassword } = body;

  const fields: Record<string, string> = {};

  if (!email || !validateEmail(email)) {
    fields.email = "INVALID_EMAIL_FORMAT";
  }

  if (!firstName?.trim()) {
    fields.firstName = "FIRST_NAME_REQUIRED";
  }

  if (!lastName?.trim()) {
    fields.lastName = "LAST_NAME_REQUIRED";
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    fields.password = passwordError;
  }

  if (password !== confirmPassword) {
    fields.confirmPassword = "PASSWORDS_DO_NOT_MATCH";
  }

  if (Object.keys(fields).length > 0) {
    throw new ValidationError("Validation failed", fields, requestId);
  }

  const existingUser = await findUserByEmail(email, requestId);
  if (existingUser) {
    throw new ValidationError(
      "Email already exists",
      { email: "EMAIL_ALREADY_EXISTS" },
      requestId
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const user = await createUser(
      {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        isAdmin: false,
        createdAt: new Date(),
      },
      requestId
    );

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id!.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    throw new DatabaseError("Failed to create user", requestId);
  }
}

export const POST = withMiddleware(handler);
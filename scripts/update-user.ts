import { createInterface } from "readline";
import bcrypt from "bcryptjs";
import clientPromise from "../lib/mongodb.ts";

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    readline.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function updateUser() {
  try {
    const email = await question("Enter user email address: ");

    if (!email) {
      readline.close();
      process.exit(1);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      readline.close();
      process.exit(1);
    }

    const client = await clientPromise;
    const db = client.db("axiom");
    const users = db.collection("users");

    const user = await users.findOne({ email });

    if (!user) {
      readline.close();
      process.exit(1);
    }

    const choice = await question("Enter your choice (1-6): ");

    let updateData: any = {};
    let updateDescription = "";

    switch (choice) {
      case "1":
        const firstName = await question(
          `Enter new first name (current: ${user.firstName}): `
        );
        if (!firstName) {
          readline.close();
          process.exit(1);
        }
        updateData.firstName = firstName;
        updateDescription = `First name to "${firstName}"`;
        break;

      case "2":
        const lastName = await question(
          `Enter new last name (current: ${user.lastName}): `
        );
        if (!lastName) {
          readline.close();
          process.exit(1);
        }
        updateData.lastName = lastName;
        updateDescription = `Last name to "${lastName}"`;
        break;

      case "3":
        const newEmail = await question(
          `Enter new email (current: ${user.email}): `
        );
        if (!emailRegex.test(newEmail)) {
          readline.close();
          process.exit(1);
        }
        const emailExists = await users.findOne({ email: newEmail });
        if (emailExists && emailExists._id.toString() !== user._id.toString()) {
          readline.close();
          process.exit(1);
        }
        updateData.email = newEmail;
        updateDescription = `Email to "${newEmail}"`;
        break;

      case "4":
        const newPassword = await question("Enter new password: ");
        if (newPassword.length < 8) {
          readline.close();
          process.exit(1);
        }
        if (!/[A-Z]/.test(newPassword)) {
          readline.close();
          readline.close();
          process.exit(1);
        }
        if (!/[a-z]/.test(newPassword)) {
          readline.close();
          process.exit(1);
        }
        if (!/[0-9]/.test(newPassword)) {
          readline.close();
          process.exit(1);
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        updateData.password = hashedPassword;
        updateDescription = "Password";
        break;

      case "5":
        const currentStatus = user.isAdmin ? "admin" : "regular user";
        const newStatus = await question(
          `Current status: ${currentStatus}. Make admin? (yes/no): `
        );
        const makeAdmin = newStatus.toLowerCase() === "yes";
        updateData.isAdmin = makeAdmin;
        updateDescription = `Admin status to ${makeAdmin}`;
        break;

      case "6":
        readline.close();
        process.exit(0);
        break;

      default:
        readline.close();
        process.exit(1);
    }

    const confirm = await question("Confirm update? (yes/no): ");

    if (confirm.toLowerCase() !== "yes") {
      readline.close();
      process.exit(0);
    }

    readline.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error);
    readline.close();
    process.exit(1);
  }
}

updateUser();

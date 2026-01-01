import { createInterface } from "readline";
import bcrypt from "bcryptjs";
import clientPromise from "../lib/mongodb";

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
    console.log("\n==============================================");
    console.log("   aXiom - Update User Script");
    console.log("==============================================\n");

    const email = await question("Enter user email address: ");

    if (!email) {
      console.log("\n❌ Error: Email is required");
      readline.close();
      process.exit(1);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("\n❌ Error: Invalid email format");
      readline.close();
      process.exit(1);
    }

    console.log(`\nSearching for user: ${email}...`);

    const client = await clientPromise;
    const db = client.db("axiom");
    const users = db.collection("users");

    const user = await users.findOne({ email });

    if (!user) {
      console.log(`\n❌ Error: No user found with email: ${email}`);
      readline.close();
      process.exit(1);
    }

    console.log(`\nFound user:`);
    console.log(`  Name: ${user.firstName} ${user.lastName}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Admin Status: ${user.isAdmin}`);
    console.log(`  Created: ${user.createdAt}`);

    console.log("\n==============================================");
    console.log("What would you like to update?");
    console.log("==============================================");
    console.log("1. First Name");
    console.log("2. Last Name");
    console.log("3. Email");
    console.log("4. Password");
    console.log("5. Admin Status");
    console.log("6. Cancel");
    console.log("==============================================\n");

    const choice = await question("Enter your choice (1-6): ");

    let updateData: any = {};
    let updateDescription = "";

    switch (choice) {
      case "1":
        const firstName = await question(
          `Enter new first name (current: ${user.firstName}): `
        );
        if (!firstName) {
          console.log("\n❌ Error: First name cannot be empty");
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
          console.log("\n❌ Error: Last name cannot be empty");
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
          console.log("\n❌ Error: Invalid email format");
          readline.close();
          process.exit(1);
        }
        const emailExists = await users.findOne({ email: newEmail });
        if (emailExists && emailExists._id.toString() !== user._id.toString()) {
          console.log("\n❌ Error: Email already in use by another user");
          readline.close();
          process.exit(1);
        }
        updateData.email = newEmail;
        updateDescription = `Email to "${newEmail}"`;
        break;

      case "4":
        const newPassword = await question("Enter new password: ");
        if (newPassword.length < 8) {
          console.log("\n❌ Error: Password must be at least 8 characters");
          readline.close();
          process.exit(1);
        }
        if (!/[A-Z]/.test(newPassword)) {
          console.log("\n❌ Error: Password must contain uppercase letter");
          readline.close();
          process.exit(1);
        }
        if (!/[a-z]/.test(newPassword)) {
          console.log("\n❌ Error: Password must contain lowercase letter");
          readline.close();
          process.exit(1);
        }
        if (!/[0-9]/.test(newPassword)) {
          console.log("\n❌ Error: Password must contain a number");
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
        console.log("\n❌ Operation cancelled");
        readline.close();
        process.exit(0);
        break;

      default:
        console.log("\n❌ Error: Invalid choice");
        readline.close();
        process.exit(1);
    }

    console.log(`\nYou are about to update: ${updateDescription}`);
    const confirm = await question("Confirm update? (yes/no): ");

    if (confirm.toLowerCase() !== "yes") {
      console.log("\n❌ Operation cancelled");
      readline.close();
      process.exit(0);
    }

    const result = await users.updateOne({ email }, { $set: updateData });

    if (result.modifiedCount === 1) {
      console.log("\n✅ Success! User updated");
      console.log(`\n${updateDescription}`);
    } else {
      console.log("\n❌ Error: Failed to update user");
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
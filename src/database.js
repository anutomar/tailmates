import mysql from "mysql2/promise";

// 1. Connecting to mysql server

const db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "anuTomar@1003",
    database: "Tailmates",
});
console.log("Connection established successfuly !");

// 2. Creating a database

// await db.execute(`create database Tailmates`);
await db.execute(`CREATE TABLE registered_users (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    First_Name VARCHAR(50),
    Last_Name VARCHAR(50),
    E_Mail VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Zip_Code VARCHAR(10),
    User_Role VARCHAR(20)
);
`);



await db.execute(`CREATE TABLE caretaker_profiles (
    Caretaker_ID INT AUTO_INCREMENT PRIMARY KEY,
    User_ID INT NOT NULL,
    Availability BOOLEAN,
    Experience FLOAT,
    Care_Type VARCHAR(50),
    Services JSON,
    Preferred_Pet_Types JSON,
    Charges DECIMAL(10,2),
    Profile_Picture_Path VARCHAR(255),
    FOREIGN KEY (User_ID) REFERENCES registered_users(ID) ON DELETE CASCADE
);
`)

console.log(await db.execute("show databases"));
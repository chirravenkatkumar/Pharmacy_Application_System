<?php
// Database connection parameters
$servername = "localhost"; // Usually 'localhost'
$username = "root"; // Your MySQL username
$password = ""; // Your MySQL password
$dbname = "pharmacy_db"; // The database name you want to connect to

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "Connected successfully";
?>

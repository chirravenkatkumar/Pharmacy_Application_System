<?php
include 'db_connect.php'; // Include the database connection file

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Retrieve form data
    $medicineName = $_POST['medicineName'];
    $medicineCause = $_POST['medicineCause'];
    $quantity = $_POST['quantity'];

    // Prepare SQL statement
    $stmt = $conn->prepare("INSERT INTO medicines (name, cause, quantity) VALUES (?, ?, ?)");
    $stmt->bind_param("ssi", $medicineName, $medicineCause, $quantity);

    // Execute the statement and check for errors
    if ($stmt->execute()) {
        // Output the new entry's details to be appended to the page
        echo "<p><strong>Medicine Name:</strong> $medicineName</p>";
        echo "<p><strong>Cause:</strong> $medicineCause</p>";
        echo "<p><strong>Quantity:</strong> $quantity</p>";
    } else {
        echo "Error: " . $stmt->error;
    }

    // Close the statement and connection
    $stmt->close();
    $conn->close();
} else {
    echo "Invalid request method.";
}
?>

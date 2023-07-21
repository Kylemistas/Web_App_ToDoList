<?php
// Establish a connection to the database
$host = 'localhost';
$user = 'root';
$password = '';
$database = 'todolist_app';

$conn = mysqli_connect($host, $user, $password, $database);
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

// Fetch all rows from the "attendance" table
$query = "SELECT * FROM todos";
$result = mysqli_query($conn, $query);

// Generate HTML to display all rows
$html = '<table style="width: 100%; border-collapse: collapse;">';
$html .= '<tr>';
$html .= '<th style="border: 1px solid black; padding: 8px;">id</th>';
$html .= '<th style="border: 1px solid black; padding: 8px;">UserName</th>';
$html .= '<th style="border: 1px solid black; padding: 8px;">Task</th>';
$html .= '<th style="border: 1px solid black; padding: 8px;">Completed</th>';
$html .= '</tr>';

while ($row = mysqli_fetch_assoc($result)) {
    $html .= '<tr>';
    $html .= '<td style="border: 1px solid black; padding: 8px;">' . $row['id'] . '</td>';
    $html .= '<td style="border: 1px solid black; padding: 8px;">' . $row['username'] . '</td>';
    $html .= '<td style="border: 1px solid black; padding: 8px;">' . $row['task'] . '</td>';
    $html .= '<td style="border: 1px solid black; padding: 8px;">' . $row['completed'] . '</td>';
    $html .= '</tr>';
}

$html .= '</table>';

// Close the database connection
mysqli_close($conn);

// Output the generated HTML
echo $html;
?>
